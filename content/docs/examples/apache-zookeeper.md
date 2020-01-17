---
title: Apache ZooKeeper
type: docs
---

# Apache ZooKeeper

Install the KUDO ZooKeeper Operator to create a cluster with the default settings:

```bash
$ kubectl kudo install zookeeper
operator.kudo.dev/v1beta1/zookeeper created
operatorversion.kudo.dev/v1beta1/zookeeper-0.2.0 created
instance.kudo.dev/v1beta1/zookeeper-instance created
```

`kubectl kudo install zookeeper` creates the `Operator`, `OperatorVersion` and `Instance` CRDs of the ZooKeeper package.

When an instance is created, the default `deploy` plan is executed:

```bash
$ kubectl get instances
NAME                 AGE
zookeeper-instance   3m15s
```

The `statefulset` defined in the `OperatorVersion` comes up with 3 pods:

```bash
$ kubectl get statefulset zookeeper-instance-zookeeper
NAME                           READY   AGE
zookeeper-instance-zookeeper   3/3     95s
```

```bash
$ kubectl get pods
NAME                             READY   STATUS    RESTARTS   AGE
zookeeper-instance-zookeeper-0   1/1     Running   0          2m2s
zookeeper-instance-zookeeper-1   1/1     Running   0          2m2s
zookeeper-instance-zookeeper-2   1/1     Running   0          2m1s
```

At this point you have a functioning three-node ZooKeeper cluster;  A [`validation` task](https://github.com/kudobuilder/operators/blob/master/repository/zookeeper/operator/templates/validation.yaml) is run as part of the deployment which ensures that it's in a healthy state and ready to service requests.
