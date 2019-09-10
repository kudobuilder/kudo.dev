# Getting Started

## Pre-requisites

Before you get started using KUDO, you need to have a running Kubernetes cluster setup. We use [Kind](https://github.com/kubernetes-sigs/kind) and [Minikube](https://github.com/kubernetes/minikube) for testing purposes.

- Setup a Kubernetes Cluster in version `1.13` or later (if you plan to use Minikube, please see the notes [below](#notes-on-minikube))
- Install [kubectl](https://kubernetes.io/docs/tasks/tools/install-kubectl/) in version `1.13` or later.

## Install KUDO CLI

Install the `kubectl kudo` plugin, To do so, please follow the [CLI plugin installation instructions](cli.md) on a Mac it is as simple as:

```
$ brew tap kudobuilder/tap
$ brew install kudo-cli
```

## Install KUDO into your cluster

Once you have a running cluster with `kubectl` installed along with the KUDO CLI plugin, you can install KUDO like so:

```
kubectl kudo init
```

If you want to manage the installation by hand the follow is also possible:

```
kubectl kudo init --dry-run -o=yaml > kudo.yaml
kubectl apply -f kudo.yaml
```

## Deploy Your First Operator

Follow the instructions in the [Apache Kafka example](examples/apache-kafka.md) to deploy a Kafka cluster along with its dependency Zookeeper.

## Create Your First Operator

To see the powers of KUDO unleashed in full, you should try [creating your own operator](developing-operators.md).

## Notes on Minikube

If you plan on developing and testing KUDO locally via Minikube, you'll need to launch your cluster with a reasonable amount of memory allocated. By default, Minikube runs with 2GB - we recommend at least 10GB, especially if you're working with applications such as [Kafka](examples/apache-kafka.md). You can start Minikube with some suitable resource adjustments as follows:

```bash
minikube start --cpus=4 --memory=10240 --disk-size=40g
```
