---
date: 2020-05-05
---

# KUDO Performance Improvement with a Surprise

This started as a straightforward single-character change. Bump the [KUDO Cassandra operator](https://github.com/mesosphere/kudo-cassandra-operator)'s dependency on KUDO controller from `v0.11.0` to `v0.11.1` to pick up its recent [performance](https://github.com/kudobuilder/kudo/commit/492bcdc6056fac6f4b018f251f8fcc766e3f0706) [improvements](https://github.com/kudobuilder/kudo/commit/dc7492401f96f8a3a774bd2d07d867feb72b5671).

What could possibly go wrong, right?

Well, [Hyrum's Law](https://www.hyrumslaw.com/) made sure it's being remembered, and this seemingly simple bump required quite a bit of debugging and a workaround to succeed.
This post describes this investigation, the cause of the issue and the workaround.

<!-- more -->

TL;DR: the performance improvements mentioned above caused the KUDO controller to always win a certain race condition. This turned a [deficiency in stateful set controller](https://github.com/kubernetes/kubernetes/issues/74374) into a deadlock.

_Reading time: 00:05:00_


## What is KUDO and KUDO-Cassandra?

[**K**ubernetes **U**niversal **D**eclarative **O**perator](https://kudo.dev/) is a toolkit that makes it easy to build [Kubernetes Operators](https://kudo.dev/#what-are-operators), in most cases just using YAML.

One of the [operators built for KUDO](https://github.com/kudobuilder/operators#operators) is one for running [Apache Cassandra](http://cassandra.apache.org/).
Its [source code repository](https://github.com/mesosphere/kudo-cassandra-operator/) contains a few [test suites](https://github.com/mesosphere/kudo-cassandra-operator/tree/master/tests/suites) which verify that certain features work as expected.

One of these suites, which [verifies various TLS configuration options](https://github.com/mesosphere/kudo-cassandra-operator/blob/8731cc938c6812e9439e729699d0fec53627b48b/tests/suites/tls/tls_test.go#L77-L250), performs the following sequence of steps *three times*, in quick succession:
1. Install `cassandra` `Operator`, `OperatorVersion` and `Instance` resources. See [KUDO docs](https://kudo.dev/docs/what-is-kudo.html#under-the-hood) if you'd like to know what these resources do.
1. Wait for the `Instance` to become healthy.

   An important detail is that the instance in turn creates a stateful set, here named `cassandra-instance-node`. This stateful set runs two pods, called `cassandra-instance-node-X`, each of which requires an auto-provisioned persistent volume.
3. [Remove](https://github.com/mesosphere/kudo-cassandra-operator/blob/78b22ddc3ab3883e099acd95bddae59ea8d5640e/tests/cassandra/cassandra.go#L212) the `cassandra` `Operator`, `OperatorVersion` and `Instance` resources.
4. [Remove](https://github.com/mesosphere/kudo-cassandra-operator/blob/78b22ddc3ab3883e099acd95bddae59ea8d5640e/tests/cassandra/cassandra.go#L216) both `PersistentVolumeClaim` resources, if they exist.

Each time the above sequence is performed, it is with a slightly different Cassandra configuration, but that is irrelevant to the subject of this post.

## The Failure

After bumping the version of KUDO controller used when running the tests, it turned out that this test *always* failed.
The failure was a timeout waiting for install (step 1 above) to finish but *never on the first execution* of this sequence.

Initial inspection showed that the `cassandra-instance-node-1` pod failed to schedule due to a missing persistent volume.

## The Investigation

### First Dead-End

I suspected that the reason I'm seeing the failure so reliably is that the timing changed significantly in the newer KUDO version.

I initially attributed this to [a bug in the PVC protection controller](https://github.com/kubernetes/kubernetes/issues/76703) that was present in k8s 1.15 that KUDO cassandra was using, because the last related `Event` that caught my eye mentioned this controller.
Unfortunately the `Event`s logged by various controllers were not enough to confirm or disprove the theory that this was the root cause.

It was only after a more careful and organized debugging session that I understood what is going on, and realized that the PVC protection controller was working as intended in this case.

### Inspecting the Audit Log

The tool which did contain all the necessary information was the `kube-apiserver` audit log.

Luckily audit logging was already turned on by default by [konvoy](https://d2iq.com/solutions/ksphere/konvoy) - the platform we use to deploy k8s - and the CI cleanup step already saved the log dumped by `konvoy diagnose`.

I only needed to improve my `jq` skills to be able to understand what it was recording.

First I aggreated the log from three master nodes into a single chronological one with:

```
cat */kube-apiserver-audit.log | \
  jq -c '[.requestReceivedTimestamp,.]' | \
  sort | \
  jq -c '.[1]' > api-log.json
```

The first `jq` command above prepends the timestamp to each log record, and prints them in a compact form, suitable for piping into `sort`.
The second `jq` invocation simply strips that timeout and pretty-prints the output.

Next, since I knew the problem was somewhere around `Pod`s, `PersistentVolume`s and `PersistentVolumeClaim`s, I looked at a chronological overview of mutations of these kinds with something like the following - refining the query step by step as I focused more and more closely on the interesting part:

```
cat api-log.json | jq '
  select(
    (.objectRef.resource=="pods" and .objectRef.name=="cassandra-instance-node-1")
    or
    (.objectRef.resource=="persistentvolumeclaims" and .objectRef.name=="var-lib-cassandra-cassandra-instance-node-1")
    or
    (.objectRef.resource=="persistentvolumes" and .objectRef.name=="pvc-2aaa4cff-ec2b-47ef-9740-e36778265492")
    or
    (.objectRef.resource=="statefulsets" and .objectRef.name=="cassandra-instance-node")
    or
    (.objectRef.resource=="instances" and .objectRef.name=="cassandra-instance"))' | \
jq -r '[.requestReceivedTimestamp,.user.username,.verb,.responseStatus.code,.objectRef.resource,.objectRef.name,.objectRef.subresource?]|@csv'  > report.csv
```

The first `jq` command applies various filters on the object reference, and the latter selects the interesting fields and prints them in CSV format.

I used LibreOffice CSV import for viewing and annotating the output in a clear tabular format.

![](/images/blog-perf-surprise-calc.png "Viewing ouput in Calc.")

Other useful filters:
- by actor:

  `select(.user.username=="kubernetes-admin" or .user.username=="system:serviceaccount:kudo-system:kudo-manager")`
- by time:

  `select(.requestReceivedTimestamp >= "2020-04-06T06:37:23" and .requestReceivedTimestamp <= "2020-04-06T06:37:51")`
  
One can also change the latter `jq` invocation to pretty-print individual records into files by selecting their exact timestamp.

```
jq 'select(.requestReceivedTimestamp=="2020-04-06T06:37:23.416332Z") |
    .responseObject' api-log.json
```

These can also be compared with a diff viewer such as [`meld`](https://meldmerge.org/), to understand the intents of individual mutations:

![](/images/blog-perf-surprise-meld.png "Comparing records with meld.")

## Root Cause

I eventually tracked down the deadlock to happen due to the following sequence of events:

1. test code detects a healthy `Instance` and starts teardown: first, it `DELETE`s the `Instance`, the operation returns immediately and proceeds in the background,
1. 7ms later, test code `DELETE`s the `PVC`s, these will also removed in the background when the `kubernetes.io/pvc-protection` finalizer is removed,
1. 20ms later, the next test starts and the test code `CREATE`s a new `Instance`,
1. 34ms later, KUDO manager takes over the `StatefulSet` (before it is garbage-collected as a result of the above deletion of the `Instance`) and `PATCH`es it to point at its new parent instance, with a new `kudo.dev/last-plan-execution-uid` annotation,
1. statefulset controller begins to roll out this change: `DELETE`s the last pod in the set (`cassandra-instance-node-1`)
1. ~30s later the kubelet get rids of the pod,
1. 25ms later, now that the pod is gone, `pvc-protection-controller` removes its finalizer from the PVC, and only now is the PVC eligible for garbage-collection,
1. 5ms later statefulset controller creates a new pod, but does not do anything the PVC, since it still considers the PVC to be present,
1. 14ms later `persistent-volume-binder` marks the PV as released and it is eventually GC-ed

The issue is that now that the pod is created, stateful set controller never considers even taking a look at the PVC, and the pod goes pending forever. This is described (among other things) in https://github.com/kubernetes/kubernetes/issues/74374 and there is even a [potential fix](https://github.com/kubernetes/kubernetes/issues/74374#issuecomment-506939665) waiting for almost a year already...

## The Trigger

I still did not understand exactly how the KUDO version bump tickled this issue.
But finding out was relatively easy now that I knew what tools to use.
I collected the audit log from a CI run on the tip the `master` branch, which still used KUDO `v0.11.0`.
It turns out that the sequence looks like this in that case:

1. test code detects a healty `Instance` and starts teardown: first, it `DELETE`s the `Instance` (same as above),
1. 84ms later, test code `DELETE`s the `PVC`s (same as above),
1. 140ms later, the next test starts and the test code `CREATE`s a new `Instance` (same as above),
1. ~700ms later garbage collector `DELETE`s the `StatefulSet` altogether,
1. only **44 seconds** later does KUDO manager come around to re-create the statefulset afresh

This time, since the `StatefulSet` is not modified in-place, the issue is not tickled.

## Conclusion

This issue illustrates how a seemingly innocent improvement in a patch release can have a surprising effect.
It also helped me learn some skills useful when trying to understand the complex system that Kubernetes is.

The workaround I employed was to [introduce](https://github.com/kudobuilder/test-tools/pull/25/files#diff-ad123099922267774b5d07924712058fR186) and [use](https://github.com/mesosphere/kudo-cassandra-operator/pull/78/files#diff-4dcd3656ff0f010419fc61b332995dcdR217) a new `UninstallWaitForDeletion` function in the [KUDO Go testing library](https://github.com/kudobuilder/test-tools/).
This function waits for the `Instance` resource to be deleted in the foreground.
This way by the time the `Instance` is created again, its underlying `StatefulSet` is guaranteed to be gone.

<Authors about="porridge" />
