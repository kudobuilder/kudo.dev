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

## EXPERIMENTAL - Validating admission webhook

In the 0.9.0 version of KUDO, we introduced a new experimental feature - validating the admission webhook. When enabled, it helps to enforce consistency of our CRs and it also makes sure that the execution plan is atomic and deterministic.

### Why we need this?

Validating [admission webhook](https://kubernetes.io/docs/reference/access-authn-authz/extensible-admission-controllers/) is HTTP callback that receives admission request (from API server) and let you apply validation rules on them. This validation cannot be performed inside the controller because that would happen AFTER the resource was stored in ETCD thus leaving us with the illegal state already in. Kubernetes admission webhooks require HTTPS to be used for this endpoint.

![Webhook accept](/images/webhook-accept.png?10x20)

![Webhook deny](/images/webhook-deny.png?10x20)

### How to enable validation?

For now, this feature is experimental thus disabled by default. If you want to enable the admission webhook on your KUDO installation, you need to run `kudo init --webhook=InstanceValidation` command which installs KUDO into your cluster with admission webhook enabled.

If you already have KUDO installed, you can run `kudo init --webhook=InstanceValidation -o yaml --dry-run` to get the Kubernetes resources needed for installation and then apply them to the cluster via `kubectl apply -f`.

Be aware that **KUDO admission webhook has a dependency on cert-manager 0.11 or higher**. You have to have the cert-manager installed in your cluster prior to installing the webhook for everything to work. To install, follow the [instructions in the docs](https://cert-manager.io/docs/installation/).

As a part of the installation KUDO will:
- expose an endpoint over HTTPS in KUDO manager for the webhook
- create ValidatingWebhookConfiguration CR
- create cert-manager self-signed issuer CR in the namespace used for KUDO installation
- create cert-manager certificate CRD signed by the issuer in the namespace used for KUDO installation
