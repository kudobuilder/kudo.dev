# What is KUDO

[[toc]]

## Overview

Kubernetes Universal Declarative Operator (KUDO) provides a declarative approach to building production-grade Kubernetes [operators](https://kubernetes.io/docs/concepts/extend-kubernetes/operator/). To quote the official documentation: _"Operators are software extensions to Kubernetes that make use of custom resources to manage applications and their components"_. While Kubernetes already comes with a lot of built-in automation to run simple workloads, complex scenarios often need a human operator. This is where KUDO is designed to help.

## Motivation

Building Kubernetes operators is not easy. While existing tools and libraries like [kubebuilder](https://book.kubebuilder.io/) and [Operator Framework](https://github.com/operator-framework/getting-started) and Kubernetes [control loop](https://kubernetes.io/docs/concepts/#kubernetes-control-plane) help with some aspects, developing an operator is still quite an undertaking. This is where the KUDO approach differs. It utilizes a Universal and Declarative approach (the UD in KUDO), doesn't require any code and significantly accelerates the development of operators. In a nutshell, KUDO does all the "Kubernetes heavy lifting" allowing the developers to concentrate on the task at hand.

## When would you use KUDO

KUDO is built to help Dev/Ops teams manage day 2 operations of services on Kubernetes, including stateful services through the management of operators. Day 2 in this context refers to the need to support more than just initial deployment. KUDO is built to support upgrades of services along with backup, recovery and the needs of observability. In a nutshell: you would use KUDO when `kubectl apply -f` (or `helm install`) isn't quite enough to manage your application lifecycle. Some examples are:

- you have a stateful service and need to automate specific workflows like backup and restore. Alternatively, you might need to execute extra logic when doing common tasks like needing to reshard when scaling up and down
- you have a micro-services application where deployment workflow has multiple serial or parallel stages (e.g. generating dynamic configuration or waiting for a migration to finish)
- you need to automate repetitive tasks around your application life-cycle like chaos and resilience testing

Find out more about how KUDO differs from other tools in the [comparison section](comparison/overview.md).

## Main Concepts

Let's talk about some concepts first. At the top level, there are _Operator Packages_.

::: attribute Operator Package
An _Operator Package_ is a collection of files that defines a KUDO operator. Think of it like a Helm Chart or Homebrew formula. An operator package can be local (a folder or tarball) or remote (tarball URL). An operator package has all the Kubernetes resources and workflow definitions to run your application.
:::

::: attribute Repository
A _Repository_ is a place that holds operator packages. It can be a local folder or a remote URL.
:::

::: attribute KUDO Manager
A _KUDO Manager_ is a set of Kubernetes controllers that understand KUDO operators and know how to execute plans.
:::

::: attribute Plan
A _Plan_ is the operator's main workflow unit. A plan specifies a series of steps that will apply or delete Kubernetes resources to the cluster in the defined order.
:::

**In a nutshell**: A user will take an _Operator Package_ from the _Repository_, submit it to the _KUDO Manager_ which will then execute operator _Plans_ either automatically or on-demand.

## Operator Plans

An operator typically consists of several plans. Think of them as runbooks written in a structured way that can be executed by KUDO. Plans are made up of phases, and phases have one or more steps. Every operator must contain at least a `deploy` plan which is the default plan to deploy an application to the cluster. For more complex applications, you would want to define a plan for backup and restore or upgrade. Phases and steps can be executed either serially or in parallel. The default execution strategy, if none is specified, is _serial_.

```text
+------------------------------------+
|  Plan                              |
|                                    |
|    +-----------------------+       |
|    |  Phase                +-+     |
|    |     +------------+    +---+   |
|    |     |  Step      ++   | | |   |
|    |     |            |-+  | | |   |
|    |     +--------------|  | | |   |
|    |      +-------------|  | | |   |
|    |        +-----------+  | | |   |
|    |                       | | |   |
|    +-----------------------+ | |   |
|      +-----------------------+ |   |
|        +-----------------------+   |
|                                    |
|                                    |
+------------------------------------+
```

Here is an example of a `deploy` plan for some abstract data service, where different node types (_bootstrap, master, agent_) has to be started in a specific serial order:

```text
plan: deploy
├── phase: bootstrap-node
│   └── step: start-bootstrap-node
├── phase: master-nodes
│   └── step: start-master-nodes
└── phase: agent-nodes
│   └── step: start-agent-nodes
└── phase: deploy-cleanup
    └── step: remove-bootstrap-node
```

After the successful deployment, the `bootstrap` node is removed. Each step has to be finished successfully e.g. corresponding nodes are running, healthy (and exposed to the network), before KUDO continues with the execution of the next phase. Learn more about plans by [writing you first operator](developing-operators/getting-started.md) and take a look at the [plans documentation](developing-operators/plans.md)

## Operator Parameters

Operators can be customized using provided parameters. Where KUDO differs from a lot of similar tools: _operator parameters are tied to plans, so that when a parameter changes a plan would be automatically triggered._ Here are two typical parameters for the number of nodes and memory that each node container is using:

```yaml
parameters:
  - name: NODE_COUNT
    description: "Number of application nodes."
    default: "3"
    trigger: "deploy"

  - name: NODE_MEM_MIB
    description: "Memory request (in MiB) for node containers."
    default: "4096"
    trigger: "update"
```

Each parameter has a `trigger` field which specifies what plan will be executed when this parameter changes. The operations required to safely update a running application can vary depending on which parameter is being updated. For instance, updating the `NODE_COUNT` may require a simple update of the deployment, whereas updating the `NODE_MEM_MIB` may require rolling out a new version via a canary or blue/green deployment. If no trigger is specified, the default `deploy` plan will be executed.

## Default Plans

By default, KUDO reserves three plan names for special purposes:

- `deploy` (**required**) as mentioned above this plan deploys the application to the cluster. This is also the default plan which is used when a parameter value changes and does not have a _trigger_.
- `upgrade` plan is used to upgrade an operator to a new version. If _upgrade_ is not defined, _deploy_ is used.
- `cleanup` plan, when exists, is triggered when an operator is removed. This gives an operator a chance to have a graceful shutdown and cleanup resources. Read more about [cleanup plans](developing-operators/plans.md#cleanup-plans).

## Under the Hood

As mentioned in the [concepts section](what-is-kudo.md#main-concepts) KUDO Manager is a set of Kubernetes controllers deployed into the cluster that handles operators, invokes plans, etc. It utilizes Kubernetes [CRDs](https://kubernetes.io/docs/concepts/extend-kubernetes/api-extension/custom-resources/) to extend Kubernetes API. The important ones are:

::: attribute Operator
An _Operator_ CRD contains the high-level description of an application to be run in a Kubernetes cluster. Not to be confused with the overall _Operator_. It contains only metadata about your application but no specific plans or resources. You can have multiple versions of your application ready to be installed in your cluster, all belonging to the same Operator.
:::

::: attribute OperatorVersion
An _OperatorVersion_ is a concrete version of your Application. It contains all the Kubernetes resources used by the operator (deployments, services), plans and parameters. Think about OperatorVersion as a Class, that when instantiated, becomes the running application.
:::

::: attribute Instance
An _Instance_ is a deployed version of your application. If the _OperatorVersion_ is a Class, _Instance_ is a specific object of that Class. It must provide missing parameter values and can override the defaults defined in the _OperatorVersion_. Creating an _Instance_ means in most cases, executing the `deploy` plan which will render and apply Kubernetes resources according to the plan phases and steps.
:::

Multiple _OperatorVersions_ of the same _Operator_ might exist in the cluster. Think about multiple teams using different Kafka versions depending on their requirements. The separation in _OperatorVersion_ and _Instance_ is useful when the same version of your application is used by different teams in the same cluster. Each team then owns a separate _Instance_ of the _OperatorVersion_ and can configure and scale it separately.

Normally, _Operator_ and _OperatorVersion_ are handled by the manager and rarely seen by the user. _Instance_, on the other hand, is present in many CLI commands, e.g. when installing an operator, the user can specify the name of the instance:

```bash
$ kubectl kudo install kafka --instance dev-kafka
```

## Executing Plans

In general, KUDO manager will automatically [execute a plan](what-is-kudo.md#operator-parameters) when the corresponding parameter changes. However, sometimes this is not enough. Sometimes you need to execute a plan manually like running a periodic `backup` plan or executing `restore` plan in case of data corruption. Such plans typically do not need a corresponding parameter. KUDO [v0.11.0](https://github.com/kudobuilder/kudo/releases/tag/v0.11.0) introduced new feature: manual plan execution. In a nutshell, you can now:

```bash
$ kubectl kudo plan trigger --name deploy --instance my-instance
```

which will execute `deploy` plan on `my-instance`. While this looks relatively easy on the surface, the devil is in detail, so let's take a closer look.

### Plan Life Cycle

Having the ability to trigger multiple plans on demand raises the question: what happens if two plans run concurrently? The answer is: it depends. Should two plans be completely independent of each other (e.g. `deploy` deploys the services and `monitor` deploys the monitoring pods) both can be executed in parallel. But if two plans in question are `backup` and `restore` or `deploy` and `migrate`? Some plans are incompatible with others. A few may not even be reentrant. While it is probably ok to restart a running `deploy` plan, a `restore` plan might not be reentrant because of possible data corruption.

We're planning to explore the realm of plan compatibility further in the future. Annotating plan affinity and anti-affinity, reentrant vs non-reentrant plans, plan cancelation and transient plan parameters are some of the topics we're examining. All contributions and feedback are highly welcome.

Having all this in mind how can we ensure correct plan execution? Meet Kubernetes admission controllers.

### Admission Controllers

In a nutshell, Kubernetes admission controllers are plugins that govern and enforce how the cluster is used. They can be thought of as a gatekeeper that intercepts (authenticated) API requests and may change the request object or deny the request altogether. Kubernetes already comes with a bunch of these [pre-installed](https://kubernetes.io/docs/reference/access-authn-authz/admission-controllers/) which govern everything from user authorization to the namespace life cycle.

KUDO manager employs an Instance admission controller that governs changes to Instances, making sure that plans do not interfere. Schematically this looks like the following:
![Instance update](/images/admission-instance-update.png)

Instance admission controller governs any update to the Instance either through manual plan execution or Instance parameter updates. The general rule of thumb is the following: all plans should be terminal (either successfully with status `COMPLETE` or unsuccessfully with `FATAL_ERROR`) before a new plan is allowed to start. A singular plan can be restarted so we assume all plans to be reentrant at least for now. While this might not be true for all plans, we think that it covers the 80/20 case e.g. when a `deploy` plan is stuck and must be restarted with less memory per node. In case a request is rejected, the Instance controller returns an error explaining why exactly the update was denied.

The admission controller would also reject parameter updates that would trigger multiple distinct plans. There are a few exceptions too: for example, a `cleanup` plan is special and is executed when an Instance is deleted. `cleanup` can not be executed manually and is allowed to override any existing plan (since the Instance is being deleted anyway).

### Installing Admission Controller

As of KUDO v0.11.0, the Instance admission controller is optional. You can install it using `kudo init --webhook=InstanceValidation` command which installs KUDO into your cluster with admission webhook enabled. If you already have KUDO installed, you can run `kudo init --webhook=InstanceValidation -o yaml --dry-run` to get the Kubernetes resources needed for installation and then apply them to the cluster via `kubectl apply -f`. See [kudo init](cli.md#examples) documentation for more details.

Any admission controller in Kubernetes is an HTTPS endpoint and thus requires a valid certificate. KUDO relies on the cert-manager **0.11 or higher** for this. You should have [cert-manager installed](https://cert-manager.io/docs/installation/) and operational **prior** to admission controller installation. Note, that we're planning to make the controller mandatory soon.
