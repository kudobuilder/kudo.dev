# KUDO Architecture

## The Purpose of KUDO

KUDO is built to help Dev/Ops teams manage day 2 operations of services on Kubernetes, including stateful services through the management of operators. Day 2 in this context refers to the need to support more than just installation. KUDO is built to support upgrades of services along with backup, recovery and the needs of observability. Building Kubernetes operators requires deep knowledge of the underlying service in addition to a deep knowledge of Kubernetes APIs. KUDO is built as an abstraction such that developers can build an operator without focusing on keeping up with the fast past of Kubernetes API changes. To this end KUDO supports the following:

* Create new KUDO operator packages
* Package operators in tarballs
* Search, Install, Uninstall operators
* Perform backup, restore and upgrade plans
* Invoke other arbitrary packaged operator plans
* Creating operator repositories with index files

## Architecture Diagram

![KUDO Architecture Diagram](/images/kudo-architecture.jpg?10x20)

## Components

**kudoctl** or `kubectl-kudo` is a [kubectl plugin](https://kubernetes.io/docs/tasks/extend-kubectl/kubectl-plugins/) command-line client. The client is used to aid developers in creating KUDO operators and is used ops teams to manage operators in a Kubernetes cluster. The client is capable of:

* Operator development
* Repository development and management
* Interacting with the deployed KUDO controller via the KUDO CRDs
  * Installing, Uninstalling operator CRDs and operators
  * Starting or getting status of an operator plan
  * Upgrading, updating, backing up or restoring operators

**KUDO CRDs** Extends the Kubernetes API to support KUDO

**KUDO Controller** Is the collection of controllers deployed into the cluster providing the service defined by the KUDO CRDs. It manages the KUDO operators. By default, there is one KUDO controller in the `kudo-system` namespace, however the architecture is flexible allowing for many KUDO controllers in different namespaces if desired. The KUDO controller is responsible for the following:

* Watch Kubernetes KUDO objects and ensure desired state
* Create KUDO operators and invoke operator plans

Read [concepts](concepts) for more details around operator, operator version and Instances.

**KUDO Repository** provides significant convenience but is not strictly required. It provides an index of operators along with URLs they may be retrieved from. Read [repository article](repository) for more details on repositories and operator layout.

## Implementation

KUDO CLI and controller are written in Go. The CLI uses Kubernetes [client-go](https://github.com/kubernetes/client-go) to communicate to controller and uses HTTP to communicate to the repository.

The KUDO controller is built using the [controller-runtime](https://github.com/kubernetes-sigs/controller-runtime) and it's transitive dependencies to communicate to Kubernetes. All state needed for KUDO is stored in CRDs. A separate database is not needed.

KUDO Operators are written in YAML.
