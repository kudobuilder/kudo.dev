# Frequently Asked Questions

[[toc]]

## What is KUDO?

Kubernetes Universal Declarative Operator (KUDO) provides a declarative approach to building production-grade Kubernetes [operators](https://coreos.com/operators/). It is an operator that is specifically designed to help provide operations to operators. We want to capture the actions that are required for managing applications in production as part of the definition for the applications themselves. Further we want to embed those best practices in the operator [CRD](https://kubernetes.io/docs/concepts/extend-kubernetes/api-extension/custom-resources/).

KUDO-based operators don’t require any code in most cases, which significantly accelerates the development of operators. It also eliminates sources of error and code duplication.

## When would you use KUDO?

You would use KUDO when `kubectl apply -f` isn't quite enough to manage your application. If you are just applying the same YAML on updates you probably won't need the extra business logic KUDO gives you.
KUDO should be used any time you would use an operator. It can provide an advanced user experience, automating such features as updates, backups and scaling.

## What is an Operator?

`Operator` is the high-level description of a deployable service which is represented as an CRD object. An example `Operator` is the [Kafka Operator](https://github.com/kudobuilder/operators/blob/master/repository/kafka/operator/) that you find in the [kudobuilder/operators](https://github.com/kudobuilder/operators) repository.

Kafka Operator Example
```yaml
apiVersion: kudo.dev/v1alpha1
kind: Operator
metadata:
  labels:
    controller-tools.k8s.io: "1.0"
  name: kafka
```

More examples can be found in the [https://github.com/kudobuilder/operators](https://github.com/kudobuilder/operators) project and include: [Flink](https://flink.apache.org/), [Kafka](https://kafka.apache.org/), and [Zookeeper](https://zookeeper.apache.org/).


## What is a Deployable Service?

A deployable service is simply a service that is deployed on a cluster. Some services are more conceptual than that, which is what KUDO aims to help with. Cassandra for instance is a service, however, in another sense, it is a concept: a collection of data service nodes. It is the collection of these instances that make up Cassandra. A Cassandra operator would capture the concept that you want to manage a Cassandra cluster. The `OperatorVersion` is the specific version of Cassandra along with any special plans to manage that cluster as outlined below.


## What is an OperatorVersion?

An `OperatorVersion` is the particular implementation of an `Operator` containing:

- [Parameters](#what-is-a-parameter)
- [Plans](#what-is-a-plan)
- [Kubernetes Objects](https://kubernetes.io/docs/concepts/overview/working-with-objects/kubernetes-objects/)

An example for an `OperatorVersion` is the [kafka-operatorversion.yaml](https://github.com/kudobuilder/operators/blob/master/repo/stable/kafka/versions/0/kafka-operatorversion.yaml) that you find in the [kudobuilder/operators](https://github.com/kudobuilder/operators) repository.

```yaml
apiVersion: kudo.dev/v1alpha1
kind: OperatorVersion
metadata:
  labels:
    controller-tools.k8s.io: "1.0"
  name: kafka-2.11-2.4.0
  namespace: default
spec:
  serviceSpec:
  version: "2.11-2.4.0"
  connectionString: ""
  operator:
    name: kafka
    kind: Operator
  parameters:
    - name: BROKER_COUNT
      description: "Number of brokers spun up for Kafka"
      default: "3"
      displayName: "Broker Count"
      ...
plans:
   deploy:
     strategy: serial
     phases:
       - name: deploy-kafka
         strategy: serial
         steps:
           - name: deploy
             tasks:
               - deploy      
```

The purpose of the `OperatorVersion` is to provide the details necessary for KUDO to become an operator for a specific capability (such as Kafka) for a version of the operator. As the operator it will execute a `Plan` to establish all the instances of Kakfa components in the cluster as defined in the operator YAML. In the example provided, it would make sure there are 3 brokers deployed.

## What is an Instance?

An `Instance` is a CRD object used as *linker* which ties an application instantiation to an `OperatorVersion`.

## What is a Plan?

Plans are how KUDO operators convey progress through service management operations, such as repairing failed tasks and/or rolling out changes to the service’s configuration. Each plan is a tree with a fixed three-level hierarchy of the plan itself, its phases, and steps within those phases. These are all collectively referred to as “Elements”. The fixed tree hierarchy was chosen in order to simplify building user interfaces that display plan content. This three-level hierarchy can look as follows:

```
Plan foo
├─ Phase bar
│  ├─ Step qux
│  └─ Step quux
└─ Phase baz
   ├─ Step quuz
   ├─ Step corge
   └─ Step grault
```

The status of the execution of a plan is captured in `Status` field in Instance CRD.

KUDO expects by default the `deploy` plan.

## What is a Parameter?

Parameters provide configuration for the instance.

## What is a Deployment Strategy?

A deployments strategy indicates the way in which a plan or step must be executed. If a step requires another step to complete first, it is necessary to declare them as `serial`. The following strategies are available by default and can be used in an `OperatorVersion` YAML definition:

- `serial`
  An example for a `serial` plan is [kafka-operatorversion.yaml](https://github.com/kudobuilder/operators/blob/master/repo/stable/kafka/versions/0/kafka-operatorversion.yaml).
- `parallel`
  An example for a `parallel` plan is [zookeeper-operatorversion.yaml](https://github.com/kudobuilder/operators/blob/master/repo/stable/kafka/versions/0/zookeeper-operatorversion.yaml).

## What is a Trigger?

When a parameter is updated in an `Instance` object, it defines the "update strategy" for the parameter in the `OperatorVersion`. This also gives you the option to customize your plan a little bit further. For instance, a change of a specific value can trigger a pre-defined plan, for example the `update` plan. You can define distinct update strategies for different parameters. For example, you might trigger the `update` plan when `image` is changed, and another plan when `replicas` is changed.

## When I Create an Operator, Will It Automatically Create New CRDs?

That is the eventual goal. We want each `OperatorVersion` (those versions of an `Operator`) to be a different API version of a command CRD that gets mapped to the operator (see also image below). An `Operator` creates a CRD and then the versions of those are defined by the `OperatorVersion`.

![KUDO dynamic CRD](/images/kudo-dymanic-crd.png?10x20)

## How Does It Work From an RBAC Perspective?

Right now everything is `namespaced`. For the current capability `Operator`, `OperatorVersion` and`Instance` are all namespaced and the permissions of the operator are all in the current namespace. For example, deletion can only happen on objects in the namespace that the instance is in. There is a trade-off between the *flexibility* of having application operators deploy their own versions in their own namespaces to manage versus having *broad capability* from a cluster perspective. With easily defining `OperatorVersions` in YAML we give you the capability to provide full operators to everyone on the cluster and you are able to give those application management pieces to those application operators individually and not have to provide support on each one of those.

## Is the dependency model an individual controller per workload?

We have one controller that handles all of the CRDs of the `Operator`, `OperatorVersion` and `Instance` types. They all are being subscribed by the same single state machine operator. For example, right now there is only an `Instance` CRD and that object is owned by its single operator. Once we start doing dynamic CRDs there will be more types dynamically subscribed by new objects registering with the operator along the way.
