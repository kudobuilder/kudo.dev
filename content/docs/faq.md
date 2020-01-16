# Frequently Asked Questions

[[toc]]

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

## How Does It Work From an RBAC Perspective?

Right now everything is `namespaced`. For the current capability `Operator`, `OperatorVersion` and `Instance` are all namespaced and the permissions of the operator are all in the current namespace. For example, deletion can only happen on objects in the namespace that the instance is in. There is a trade-off between the *flexibility* of having application operators deploy their own versions in their own namespaces to manage versus having *broad capability* from a cluster perspective. With easily defining `OperatorVersions` in YAML we give you the capability to provide full operators to everyone on the cluster and you are able to give those application management pieces to those application operators individually and not have to provide support on each one of those.
