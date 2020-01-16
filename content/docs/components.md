# Components

KUDO consists of multiple components to provide its functionality. Some components are running in a Kubernetes cluster, others are running locally. The architecture diagramm gives an overview over the components of KUDO.

![KUDO Architecture Diagram](/images/kudo-architecture.jpg?10x20)

## KUDO CLI

**kubectl-kudo** is a [kubectl plugin](https://kubernetes.io/docs/tasks/extend-kubectl/kubectl-plugins/) command-line client. It aids developers in creating KUDO operators and ops teams to manage operators in a Kubernetes cluster. The client is capable of:

* Deploying the KUDO controller
* Operator development
* End to end test harness execution
* Repository development and management
* Interacting with the deployed KUDO controller
  * Installing and uninstalling operators
  * Starting operator plans and querying their status
  * Upgrading, updating, backing up and restoring operators

## Controller

The **KUDO Controller** is a collection of controllers deployed into the cluster. The KUDO Controller manages operators deployed with the KUDO CLI. The KUDO controller:

* Watches Kubernetes KUDO objects and ensures their desired state
* Creates KUDO operators and invokes their plans

## Custom Resource Definitions

**KUDO CRDs** extend the Kubernetes API with the `Operator`, `OperatorVersion` and `Instance` resources. The KUDO controller manages these resources.

Read about KUDO's [concepts](concepts.md) (TODO) for more details around the `Operator`, `OperatorVersion` and `Instance` resources.

## Repository

A **KUDO Repository** provides an index of operators. Read about the [operator repository](repository.md) (TODO) for more details on repositories and operator layout.

## Security and Permissions

Installing the KUDO controller using `kudo init` (TODO: link to CLI) creates a namespace `kudo-system` and service account `kudo-manager`. A cluster role binding sets the service account permissions to `cluster-admin`.
