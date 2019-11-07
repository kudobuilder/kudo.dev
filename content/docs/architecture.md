# Architecture

## The Purpose of KUDO

KUDO is built to help Dev/Ops teams manage day 2 operations of services on Kubernetes, including stateful services through the management of operators. Day 2 in this context refers to the need to support more than just installation. KUDO is built to support upgrades of services along with backup, recovery and the needs of observability. Building Kubernetes operators requires deep knowledge of the underlying service in addition to a deep knowledge of Kubernetes APIs. KUDO is built as an abstraction such that developers can build an operator without focusing on keeping up with the fast pace of Kubernetes API changes. To this end KUDO supports the following:

* Create new KUDO operator packages
* Package operators in tarballs
* Search, install, uninstall operators
* Perform backup, restore and upgrade plans
* Invoke other arbitrary packaged operator plans
* Create operator repositories with index files

## Architecture Diagram

![KUDO Architecture Diagram](/images/kudo-architecture.jpg?10x20)

## Components

**kubectl-kudo** is a [kubectl plugin](https://kubernetes.io/docs/tasks/extend-kubectl/kubectl-plugins/) command-line client, which is invoked by `kubectl kudo`. The client is built to aid developers in creating KUDO operators and is used by ops teams to manage operators in a Kubernetes cluster. The client is capable of:

* Operator development
* End to end test harness execution
* Repository development and management
* Interacting with the deployed KUDO controller via KUDO CRDs
  * Installing and uninstalling operator CRDs and operators
  * Starting operator plans and querying their status 
  * Upgrading, updating, backing up and restoring operators

**KUDO CRDs** extend the Kubernetes API to support KUDO

**KUDO Controller** is a collection of controllers deployed into the cluster into the `kudo-system` namespace. The KUDO Controller provides the service defined by the related KUDO CRDs, and is managing KUDO operators. The KUDO controller is responsible for:

* Watching Kubernetes KUDO objects and ensuring desired state
* Creating KUDO operators and invoking operator plans

Read about KUDO's [concepts](concepts.md) for more details around operators, operator versions and instance CRDs.

**KUDO Repository** provides significant convenience but is not strictly required. It provides an index of operators along with URLs they may be retrieved from. Read about the [operator repository](repository.md) for more details on repositories and operator layout.

## Implementation

KUDO CLI and controller are written in Go. The CLI uses Kubernetes [client-go](https://github.com/kubernetes/client-go) to communicate to controller and uses HTTP to communicate to the repository.

The KUDO controller is built using the [controller-runtime](https://github.com/kubernetes-sigs/controller-runtime) and it's transitive dependencies to communicate to Kubernetes. All state needed for KUDO is stored in CRDs. A separate database is not needed.

KUDO operators are written in YAML.
