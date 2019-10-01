---
date: 2019-10-02
---

# From Mesos to KUDO

When I started on KUDO, the first thing I need to wrap my head around was the difference between [Mesos](http://mesos.apache.org/) and [Kubernetes](https://kubernetes.io). I already had operator level experience with both, but my level of technical depth for Mesos was high and I needed a more intimate understanding of Kubernetes. In the process of coming up to speed I threw together guide for other Mesosnauts that I've been encourage could be useful for a wider audience. The details assume that you know or understand Mesos and it's eco-system and that you are new to Kubernetes.

<!-- more -->

## Kubernetes Operators and KUDO

The purpose of KUDO is to be able to make the creation and management of Kubernetes [operators](https://kubernetes.io/docs/concepts/extend-kubernetes/operator/) simple and reusable. A Kubernetes operator, like a Mesos Framework, is software that connects to the Kubernetes cluster and controls aspects of provisioning and maintenance strategies to the cluster usually to achieve the availability of a specific service. A simple provisioning example is HDFS. For HA of HDFS, it is necessary to install 3 JournalNodes (JN) on 3 separate fault domains (commonly across 3 different worker nodes), then provision and format a NameNode (NN) on 1 of the JN nodes, then bootstrap a 2nd NN on a JN but not on the same node as NN1 and so on. This recipe is codified into a controller which in Kubernetes parlance is called an operator.

With years of DC/OS experience, Mesosphere created the SDK to make the creation of a Framework simple, often just a YAML configuration and it is believed the same opportunity exists for Kubernetes operators which is the purpose of KUDO.

KUDO's goal is to simplify creation of an operator. This includes:
1. standard conventions of defining provision plans
2. standard expectations for install, uninstall, upgrade, backup/restore
3. CLI integration for control of the operator

## From Frameworks to Operators

While operators are relatively new (being [introduced the end of 2016](https://coreos.com/blog/introducing-operators.html)), they have a lot in common with [Mesos Frameworks](http://mesos.apache.org/documentation/latest/app-framework-development-guide/). It is expected that many developers from the Mesos community or possibility with limited Kubernetes might want to help out on KUDO. For this reason, The following is provided to jump-start the Kubernetes learning curve.

The following is a check list with resources to accelerate that learning curve.  This blog post goes into each of these topics:

1. [Learn Kubernetes Basics and Internals](#learn-kubernetes-basics)
2. [Learn kubectl](#learn-kubectl)
3. [Learn Kubernetes API / Resources](#learn-kubernetes-api-resources)
4. [Learn Custom Resource Definitions](#learn-custom-resource-defintions)
5. [Learn Kubernetes Operators](#learn-kubernetes-operators)
6. [Dynamic CRD / KUDO](#dynamic-crd-kudo)

## Learn Kubernetes Basics

The [Kubernetes Docs](https://kubernetes.io/docs/home/) are fantastic. Get started with Minikube. Step 1 is becoming familiar with the basic concepts. At a minimum go through the [Hello Minikube](https://kubernetes.io/docs/tutorials/hello-minikube/) tutorial.

Important in the learning at this phase is understanding the concept of "Kind" which is one of the [top level API Objects](https://kubernetes.io/docs/reference/federation/v1/definitions/). [Kinds](https://github.com/kubernetes/community/blob/master/contributors/devel/sig-architecture/api-conventions.md#types-kinds) for a default cluster includes `Pod`, `ReplicationController`, `Service`, `Namespace`, `Node`. Each of these you can query or manipulate from the CLI with `kubectl get pod`.

Now that you have some basics, Understand the communication and event based system that is behind Kubernetes with this video: [Events, the DNA of Kubernetes](https://www.mgasch.com/post/k8sevents/). The event system details provided by this blog post are crucial for understanding the core of Kubernetes.

Resources:
* [Kubernetes by Example](http://kubernetesbyexample.com/)

## Learn kubectl

This will just take time but it is incredibly useful to start with [kubectl Cheat Sheet](https://kubernetes.io/docs/reference/kubectl/cheatsheet/).

It is useful to understand creating objects from the CLI and from files. It is important to understand that K8S works with YAML, JSON and protobuf. It uses and stores objects in protobuf internally and can output in a number of formats which include YAML or JSON. Try:

```
kubectl create deployment nginx --image=nginx
## Followed by
kubectl get deployment -o yaml
```
YAML is commonly the file format of choice. JSON is useful when working with `jq` for a specific element.

For deeper learning into Kubernetes there are 2 options which are superb: `-w` for watch and `-v=7` for verbose level.
If you are trying to understand deployments try the following:
In terminal 1: `kubectl get deployment -w -v=7`
In terminal 2: `kubectl create deployment nginx --image=nginx`

Resources:
* [kubectl plugins](https://kubernetes.io/docs/tasks/extend-kubectl/kubectl-plugins/)

## Learn Kubernetes API / Resources

It is important to understand that all interactions with Kubernetes is through the API Server. Start with the [Kubernetes API Concepts](https://kubernetes.io/docs/reference/using-api/api-concepts/). Focus on Resources and Resource Types. They are defined as part of the API. Understand the basic format of `/apis/GROUP/VERSION/RESOURCETYPE` or `/apis/GROUP/VERSION/RESOURCETYPE/NAME` for working with a resource.

A great way to learn the base API is to `kubectl proxy`. Then browse the API with `curl localhost:8001` or `curl localhost:8001/apis/batch/v1`

Once you have the basics read Michael Hausenblas's post on [Kubernetes deep dive: API Server - part 1](https://blog.openshift.com/kubernetes-deep-dive-api-server-part-1/). Followed by [Part 2](https://blog.openshift.com/kubernetes-deep-dive-api-server-part-2/) and [Part 3](https://blog.openshift.com/kubernetes-deep-dive-api-server-part-3a/).

## Learn Custom Resource Definitions

Now that we understand the API / Resources that come with Kubernetes, you might be wondering *am I limited to that? or can I extend that?* That is where Custom Resource Definitions (CRD) come in. We can extend Kubernetes by defining extensions to its API. You might start with the [official CRD docs](https://kubernetes.io/docs/tasks/access-kubernetes-api/custom-resources/custom-resource-definitions/). It is worth going through the exercises presented there. If you want to watch and learn, start with [Stefan Schimanski's CRD talk](https://www.youtube.com/watch?v=Ne4jQF-CPIM) on the topic.

Addition resources:
* [Custom Resources](https://kubernetes.io/docs/concepts/extend-kubernetes/api-extension/custom-resources/)
* [Part 3a](https://blog.openshift.com/kubernetes-deep-dive-api-server-part-3a/) of API Service deep dive series
* [Stefan Schimanski's 36 min talk](https://www.youtube.com/watch?v=Ne4jQF-CPIM) on the topic
* [Extending Kubernetes with Custom Resources](https://thenewstack.io/extend-kubernetes-1-7-custom-resources/)
* [Kubernetes CRD Tutorial](https://github.com/yaronha/kube-crd)

## Learn Kubernetes Operators

In order to understand operators, it is useful to understand [Kubernetes controllers](https://stackoverflow.com/questions/47848258/kubernetes-controller-vs-kubernetes-operator) which may raise the question what the difference is. It is best answer on [stackoverflow](https://stackoverflow.com/a/47857073/1375187). The Kubernetes community as a great read on [Writing Controllers](https://github.com/kubernetes/community/blob/master/contributors/devel/sig-api-machinery/controllers.md) which includes a [sample controller](https://github.com/kubernetes/sample-controller).

Resources:
* [What is an Operator](https://operatorhub.io/what-is-an-operator)
* [CoreOs Blog on Operators](https://coreos.com/blog/introducing-operator-framework)
* [Operator SDK](https://github.com/operator-framework/operator-sdk)
* [Article on Writing first operator](https://medium.com/devopslinks/writing-your-first-kubernetes-operator-8f3df4453234)
* [Operator from CRD Tutorial](https://github.com/yaronha/kube-crd/blob/master/kube-crd.go)

## KUDO

Now we can talk KUDO. KUDO is about creating CRD on the fly based on information passed to it or Dynamic CRD. It is about being 1 operator for a number of operator configurations.

From the [KUDO Website](https://kudo.dev/) it is worth looking at the [comparison guide](https://kudo.dev/docs/comparison/#comparison_table).

The [KUDO project](https://github.com/kudobuilder/kudo) is written in Go. It was initially created using kubebuilder. It also contains the CLI code. CI service is by circleci. All artifacts can be built (if all prerequisites are met) with the Makefile.  Releases [as outlined](https://github.com/kudobuilder/kudo/blob/master/RELEASE.md) are released with [goreleaser](https://goreleaser.com/).

Example operators on in the [operator GH project](https://github.com/kudobuilder/operators).

Follow the [Readme.md](https://github.com/kudobuilder/kudo/blob/master/README.md) and guides to get started.

Features are add to KUDO using a KEP process, however that is the [KUDO Enhancement Process](https://github.com/kudobuilder/kudo/blob/e8a524ccd87c5cd086477f19ddf4a7de97add9e2/keps/0001-kep-process.md).  Think Kubernetes Enhancement Process simplified.

Design Work:

* [Create your first operator](https://kudo.dev/docs/#create-your-first-operator)
* [KUDO CLI Design](https://docs.google.com/document/d/1v-hGZduj8yYGBPb4CIkydOsWu4airNrDlI1NfmpL7KA/edit#heading=h.b4kgspqzjko7)


## Author

[Ken Sipe](https://twitter.com/kensipe)
