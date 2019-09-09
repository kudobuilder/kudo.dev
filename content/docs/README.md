# Getting Started

## Pre-requisites

Before you get started using KUDO, you need to have a running Kubernetes cluster setup. You can use Minikube for testing purposes.

- Setup a Kubernetes Cluster in version `1.13` or later (if you plan to use [Minikube](https://kubernetes.io/docs/tasks/tools/install-minikube/), please see the notes [below](#notes-on-minikube))
- Install [kubectl](https://kubernetes.io/docs/tasks/tools/install-kubectl/) in version `1.13` or later.

## Install KUDO Into Your Cluster

Once you have a running cluster with `kubectl` installed, you can install KUDO like so:

```bash
kubectl create -f https://raw.githubusercontent.com/kudobuilder/kudo/v0.5.0/docs/deployment/00-prereqs.yaml
kubectl create -f https://raw.githubusercontent.com/kudobuilder/kudo/v0.5.0/docs/deployment/10-crds.yaml
kubectl create -f https://raw.githubusercontent.com/kudobuilder/kudo/842c7f19a0a361751f0dab330faf3be147c9c4b3/docs/deployment/20-deployment.yaml
```

You can optionally install the `kubectl kudo` plugin, which provides a convenient set of commands that make using KUDO even easier. To do so, please follow the [CLI plugin installation instructions](cli.md).

## Deploy Your First Operator

Follow the instructions in the [Apache Kafka example](examples/apache-kafka.md) to deploy a Kafka cluster along with its dependency Zookeeper.

## Create Your First Operator

To see the powers of KUDO unleashed in full, you should try [creating your own operator](developing-operators.md). 

## Notes on Minikube

If you plan on developing and testing KUDO locally via Minikube, you'll need to launch your cluster with a reasonable amount of memory allocated. By default, Minikube runs with 2GB - we recommend at least 10GB, especially if you're working with applications such as [Kafka](examples/apache-kafka.md). You can start Minikube with some suitable resource adjustments as follows:

```bash
minikube start --cpus=4 --memory=10240 --disk-size=40g
```
