# Architecture

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

Read about KUDO's [concepts](what-is-kudo.md#under-the-hood) for more details around operators, operator versions and instance CRDs.

**KUDO Repository** provides significant convenience but is not strictly required. It provides an index of operators along with URLs they may be retrieved from. Read about the [operator repository](https://github.com/kudobuilder/operators) for more details on repositories and operator layout.

## Implementation

KUDO CLI and controller are written in Go. The CLI uses Kubernetes [client-go](https://github.com/kubernetes/client-go) to communicate to controller and uses HTTP to communicate to the repository.

The KUDO controller is built using the [controller-runtime](https://github.com/kubernetes-sigs/controller-runtime) and it's transitive dependencies to communicate to Kubernetes. All state needed for KUDO is stored in CRDs. A separate database is not needed.

KUDO operators are written in YAML.
