# Getting Started

## Pre-requisites

Before you get started using KUDO, you need to have a running Kubernetes cluster setup. We use [Kind](https://github.com/kubernetes-sigs/kind) and [Minikube](https://github.com/kubernetes/minikube) for testing purposes.

- Setup a Kubernetes Cluster in version `1.13` or later (if you plan to use Minikube, please see the notes [below](#notes-on-minikube))
- Install [kubectl](https://kubernetes.io/docs/tasks/tools/install-kubectl/) in version `1.13` or later.

## Install KUDO CLI

Install the `kubectl kudo` plugin. To do so, please follow the [CLI plugin installation instructions](cli.md).

The KUDO CLI leverages the kubectl plugin system, which gives you all its functionality under `kubectl kudo`. This is a convenient way to install and deal with your KUDO Operators.

## Install KUDO into your cluster

Once you have a running cluster with `kubectl` installed along with the KUDO CLI plugin, you can install KUDO like so:

```bash
$ kubectl kudo init
```

This will create several resources. First, it will create the [Custom Resource Definitions](https://kubernetes.io/docs/concepts/extend-kubernetes/api-extension/custom-resources/), [service account](https://kubernetes.io/docs/tasks/configure-pod-container/configure-service-account/), and [role bindings](https://kubernetes.io/docs/reference/access-authn-authz/rbac/) necessary for KUDO to operate. It will also create an instance of the [KUDO controller](https://kudo.dev/docs/architecture.html#components) so that we can begin creating instances of applications.

If you want to manage the installation by hand the following is also possible:

```bash
$ kubectl kudo init --dry-run -o=yaml > kudo.yaml
$ kubectl apply -f kudo.yaml
```

See [kudo init documentation](cli.md#kudo-init)  for more KUDO installation options.

## Deploy Your First Operator

To get started, follow the instructions in the [Apache Kafka example](examples/apache-kafka.md) to deploy a Kafka cluster along with its dependency ZooKeeper.

See the KUDO Operator repository at [https://github.com/kudobuilder/operators/](https://github.com/kudobuilder/operators) for more KUDO Operators and documentation.

## Create Your First Operator

To see the powers of KUDO unleashed in full, you should try [creating your own operator](developing-operators/getting-started.md).

## Notes on Minikube

If you plan on developing and testing KUDO locally via Minikube, you'll need to launch your cluster with a reasonable amount of memory allocated. By default, Minikube runs with 2GB - we recommend at least 10GB, especially if you're working with applications such as [Kafka](examples/apache-kafka.md). You can start Minikube with some suitable resource adjustments as follows:

```bash
$ minikube start --cpus=4 --memory=10240 --disk-size=40g
```

## Notes on KIND

In order to use KIND with storage Operators, you must be using KIND version 0.7.0 or newer.
