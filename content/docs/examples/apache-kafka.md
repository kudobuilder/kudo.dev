---
title: Apache Kafka
type: docs
---

# Apache Kafka

## Dependencies

Apache Kafka depends on ZooKeeper so we need to run it first. Follow the [ZooKeeper example](apache-zookeeper.md) to run a basic cluster.

## Run Kafka

Install the KUDO Kafka Operator to create a Kafka cluster with the default options:

```bash
$ kubectl kudo install kafka
operator.kudo.dev/v1beta1/kafka created
operatorversion.kudo.dev/v1beta1/kafka-1.0.0 created
instance.kudo.dev/v1beta1/kafka-instance created
```

`kubectl kudo install kafka` creates the `Operator`, `OperatorVersion` and `Instance` CRDs of the Kafka package.

When an instance is created, the default `deploy` plan is executed:

```
$ kubectl get instances
NAME                 AGE
kafka-instance       24s
zookeeper-instance   24m
```

The stateful set defined in the `OperatorVersion` comes up with 3 pods:

```bash
$ kubectl get statefulset kafka-instance-kafka
NAME                   READY   AGE
kafka-instance-kafka   3/3     55s
```

```bash
$ kubectl get pods
NAME                             READY   STATUS    RESTARTS   AGE
kafka-instance-kafka-0           1/1     Running   0          7m7s
kafka-instance-kafka-1           1/1     Running   0          6m22s
kafka-instance-kafka-2           1/1     Running   0          5m36s
zookeeper-instance-zookeeper-0   1/1     Running   0          30m
zookeeper-instance-zookeeper-1   1/1     Running   0          30m
zookeeper-instance-zookeeper-2   1/1     Running   0          30m
```

You can find more details around configuring a Kafka cluster in the [KUDO Kafka documentation](https://github.com/kudobuilder/operators/tree/master/repository/kafka).
