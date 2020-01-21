---
date: 2019-12-06
---

# From Mesos to KUDO

When I started on KUDO, the first thing I needed to wrap my head around was the difference between [Mesos](http://mesos.apache.org/) and [Kubernetes](https://kubernetes.io). I already had operator level experience with both, but my technical understanding of Mesos was high and I needed a more intimate understanding of Kubernetes. In the process of coming up to speed I threw together a guide for other Mesonauts. I've been encouraged that this guide could be useful for a wider audience. This guide assumes that you know or understand Mesos and its eco-system, and that you are new to Kubernetes.

<!-- more -->

## Kubernetes Operators and KUDO

The purpose of KUDO is to be able to make the creation and management of Kubernetes [operators](https://kubernetes.io/docs/concepts/extend-kubernetes/operator/) simple and reusable. A Kubernetes operator is similar to  a Mesos Framework. Operators are a piece of software that connects to the Kubernetes cluster and controls aspects of provisioning and maintenance strategies to the cluster, usually to achieve the availability of a specific service. A simple provisioning example is HDFS. For HA of HDFS, it is necessary to install 3 JournalNodes (JN) on 3 separate fault domains (commonly across 3 different worker nodes), then provision and format a NameNode (NN) on 1 of the JN nodes, then bootstrap a 2nd NN on one of the remaining JN nodes and so on. This recipe is codified into a controller which in Kubernetes parlance is called an operator.

With years of experience writing Mesos Frameworks, Mesosphere created an SDK to make the creation of Frameworks simple. A lot of these are as simple as a YAML configuration and we believe that the same opportunity exists for Kubernetes operators which is the purpose of KUDO: KUDO's goal is to simplify creation of an operator.

This includes:

* standard conventions of defining provision plans
* standard expectations for install, uninstall, upgrade, backup/restore
* CLI integration for control of the operator

## From Frameworks to Operators

The concept of operators is relatively new: it was [introduced near the end of 2016](https://coreos.com/blog/introducing-operators.html). Yet, they have a lot in common with [Mesos Frameworks](http://mesos.apache.org/documentation/latest/app-framework-development-guide/).
The following is provided to help you jump-start the Kubernetes learning curve assuming you already have a background in the Mesos community, and have limited experience with Kubernetes. This is all the information needed to get involved with KUDO (we’d love if you did).

The following is a checklist with resources to accelerate that learning curve. This blog post goes into each of these topics:

1. [Learn Kubernetes Basics and Internals](#learn-kubernetes-basics)
2. [Learn kubectl](#learn-kubectl)
3. [Learn Kubernetes API / Resources](#learn-kubernetes-api-resources)
4. [Learn Custom Resource Definitions](#learn-custom-resource-defintions)
5. [Learn Kubernetes Operators](#learn-kubernetes-operators)
6. [Dynamic CRD / KUDO](#dynamic-crd-kudo)

## Learn Kubernetes Basics

The [Kubernetes Docs](https://kubernetes.io/docs/home/) are fantastic. I suggest you get started with Minikube and become familiar with the basic concepts. At a minimum, go through the [Hello Minikube](https://kubernetes.io/docs/tutorials/hello-minikube/) tutorial.

Important in the learning at this phase is understanding the concept of "Kind" which is one of the [top level API Objects](https://v1-13.docs.kubernetes.io/docs/reference/federation/v1/definitions/). [Kinds](https://github.com/kubernetes/community/blob/master/contributors/devel/sig-architecture/api-conventions.md#types-kinds). Kinds for a default cluster includes `Pod`, `ReplicationController`, `Service`, `Namespace`, `Node`. Each of these you can query or manipulate from the CLI using `kubectl`, for example: `kubectl get pod`.

Now that you have some basics, it is important to understand the communication and event based system that is behind Kubernetes with this video: [Events, the DNA of Kubernetes](https://www.mgasch.com/post/k8sevents/). The event system details provided by this blog post are crucial for understanding the core of Kubernetes.

Resources:
* [Kubernetes by Example](http://kubernetesbyexample.com/)

## Learn kubectl

This will just take time but it is incredibly useful to start with [kubectl Cheat Sheet](https://kubernetes.io/docs/reference/kubectl/cheatsheet/).

It is useful to understand creating objects from the CLI and from files. It is important to understand that Kubernetes works with YAML, JSON and protobuf. It uses and stores objects in protobuf internally and can output in a number of formats which include YAML or JSON. Try:

```
kubectl create deployment nginx --image=nginx
## Followed by
kubectl get deployment -o yaml
```
YAML is commonly the file format of choice. JSON is useful when working with `jq` for a specific element.

For deeper learning into Kubernetes there are 2 options which are superb: `-w` for watch and `-v=7` for verbose level.
If you are trying to understand deployments try the following:

* In terminal 1: `kubectl get deployment -w -v=7`
* In terminal 2: `kubectl create deployment nginx --image=nginx`

Resources:
* [kubectl plugins](https://kubernetes.io/docs/tasks/extend-kubectl/kubectl-plugins/)

## Learn Kubernetes API / Resources

It is important to understand that all interactions with Kubernetes is through the API Server. Start with the [Kubernetes API Concepts](https://kubernetes.io/docs/reference/using-api/api-concepts/). Focus on Resources and Resource Types. They are defined as part of the API. Understand the basic format of `/apis/GROUP/VERSION/RESOURCETYPE` or `/apis/GROUP/VERSION/RESOURCETYPE/NAME` for working with a resource.

A great way to learn the base API is to `kubectl proxy`. Then browse the API with `curl localhost:8001` or `curl localhost:8001/apis/batch/v1`

Once you have the basics read Michael Hausenblas's post on [Kubernetes deep dive: API Server - part 1](https://blog.openshift.com/kubernetes-deep-dive-api-server-part-1/). Followed by [Part 2](https://blog.openshift.com/kubernetes-deep-dive-api-server-part-2/) and [Part 3](https://blog.openshift.com/kubernetes-deep-dive-api-server-part-3a/).

## Learn Custom Resource Definitions

Now that you understand the API / Resources that come with Kubernetes, you might be wondering *am I limited to that? or can I extend that?* That is where Custom Resource Definitions (CRD) come in. You can extend Kubernetes by defining extensions to its API. You might start with the [official CRD docs](https://kubernetes.io/docs/tasks/access-kubernetes-api/custom-resources/custom-resource-definitions/). It is worth going through the exercises presented there. If you want to watch and learn, start with [Stefan Schimanski's CRD talk](https://www.youtube.com/watch?v=Ne4jQF-CPIM) on the topic.

Additional resources:
* [Custom Resources](https://kubernetes.io/docs/concepts/extend-kubernetes/api-extension/custom-resources/)
* [Extending Kubernetes with Custom Resources](https://thenewstack.io/extend-kubernetes-1-7-custom-resources/)
* [Kubernetes CRD Tutorial](https://github.com/yaronha/kube-crd)

## Learn Kubernetes Operators

In order to understand operators, it is useful to understand [Kubernetes controllers](https://stackoverflow.com/questions/47848258/kubernetes-controller-vs-kubernetes-operator) first, which may raise the question what the difference is. It is best answered on [stackoverflow](https://stackoverflow.com/a/47857073/1375187). The Kubernetes community has a great read on [Writing Controllers](https://github.com/kubernetes/community/blob/master/contributors/devel/sig-api-machinery/controllers.md) which includes a [sample controller](https://github.com/kubernetes/sample-controller).

Resources:
* [What is an Operator](https://operatorhub.io/what-is-an-operator)
* [CoreOs Blog on Operators](https://coreos.com/blog/introducing-operator-framework)
* [Operator SDK](https://github.com/operator-framework/operator-sdk)
* [Article on Writing first operator](https://medium.com/devopslinks/writing-your-first-kubernetes-operator-8f3df4453234)
* [Operator from CRD Tutorial](https://github.com/yaronha/kube-crd/blob/master/kube-crd.go)

## KUDO

Now we can talk KUDO. KUDO is about creating CRDs on the fly based on information passed to it or Dynamic CRD. It is about being 1 operator for a number of operator configurations.

From the [KUDO Website](https://kudo.dev/) it is worth looking at the [comparison guide](https://kudo.dev/docs/comparison/#comparison_table).

The [KUDO project](https://github.com/kudobuilder/kudo) is written in Go. It was initially created using kubebuilder. It also contains the CLI code. CI service is by circleci. All artifacts can be built (if all prerequisites are met) with the Makefile. Releases [as outlined](https://github.com/kudobuilder/kudo/blob/master/RELEASE.md) are released with [goreleaser](https://goreleaser.com/).

Example operators on in the [operator GH project](https://github.com/kudobuilder/operators).

Follow the [Readme.md](https://github.com/kudobuilder/kudo/blob/master/README.md) and guides to get started.

Features are proposed and eventually added to KUDO using the [KUDO Enhancement Process](https://github.com/kudobuilder/kudo/blob/e8a524ccd87c5cd086477f19ddf4a7de97add9e2/keps/0001-kep-process.md) (KEP). This is a simplified variant of the Kubernetes Enhancement Process.


Design Work:

* [Create your first operator](https://kudo.dev/docs/#create-your-first-operator)
* [KUDO CLI Design](https://docs.google.com/document/d/1v-hGZduj8yYGBPb4CIkydOsWu4airNrDlI1NfmpL7KA/edit#heading=h.b4kgspqzjko7)


<Authors about="kensipe" />
