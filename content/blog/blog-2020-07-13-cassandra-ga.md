---
date: 2020-07-13
---

# KUDO Cassandra 1.0.0 Released

We have recently released [KUDO Cassandra](https://github.com/mesosphere/kudo-cassandra-operator) 1.0.0 for general availability. 

Some highlights from this release are:

* Backup & Restore
* Node Replace/Node Recovery
* Multi-Datacenter Cluster

<!-- more -->

## Backup & Restore

For KUDO Cassandra, we have integrated [Cassandra Medusa](https://github.com/thelastpickle/cassandra-medusa) to allow easy backup and restore operations.
Medusa is a backup system for Cassandra that provides support for backups to Amazon S3, Google Cloud Storage and local storage. At the moment we have only integrated the AWS S3 solution, but can easily add support for the other storage providers, supported by [Apache libcloud](https://libcloud.readthedocs.io/en/stable/storage/supported_providers.html)

With version 1.0.0, it is possible to do a full cluster backups and restore the backups to a new instance of the cluster - it is not possible to restore single nodes, but as Cassandra is a distributed database, a full cluster restore is a more probable use case.

To enable backup and restore functionality, there is a single parameter: `BACKUP_RESTORE_ENABLED`. This will deploy a sidecar container on each Cassandra Node which contains Medusa. The actual backup is triggered by a Job that execs Medusa in the sidecar.

For a restore, the parameter sets up an init container that will run before the actual C* node container, download the backup and initialize the data for that node.

Details about this feature can be found [here](https://github.com/mesosphere/kudo-cassandra-operator/blob/master/docs/backup.md).

## Node Eviction/Node Recovery

One of the tasks of running a bigger Cassandra cluster is handling node failures and node replacement. There are generally two options for the storage provider. Either elastic block storage, which makes it easy to have the same data available on multiple servers, but limits the performance and is an additional complex software to manage. The second option is local storage, which provides the best performance, but has the risk of data loss in case of failure.

Apache Cassandra is designed to tolerate node failure - as long as the minimum number of required nodes are up and running and the replication factor for a keyspace is setup correctly, copies of the data are stored on different nodes. But local storage requires manual intervention when a Cassandra node really fails. The cluster needs to be informed that a node was lost and was replaced, in case of Kubernetes the persistent volume and persistent volume claims need to be cleaned up, etc.

With KUDO Cassandra we developed a feature that can handle failed Kubernetes nodes (semi-)automatically. When KUDO Cassandra is deployed with `RECOVERY_CONTROLLER` enabled, we start an additional controller that monitors the deployed pods. When a pod fails to be scheduled because of a failed Kubernetes node it tries to get the state of the failed node. As long as the node is just marked as down, the controller will take no action. Only when the Kubernetes node is removed from the Cluster by an administrator the recovery controller will take action. In this case it will remove the persistent volume claim that is bound to the failed Kubernetes node, and reschedules the pod. As the PVC is now missing, the pod gets rescheduled on to a different Kubernetes node. 

The node eviction works similarly, but without a Kubernetes node failure. To evict a node the recovery controller watches for a specific label with the name `kudo-cassandra/evict` on the pods. If this label is found, the handling is the same: The PVC is removed and the pod is rescheduled.

KUDO Cassandra maintains a mapping for each Cassandra node - when the replacement node is scheduled on a new Kubernetes node, the bootstrap process of KUDO Cassandra detects that it is a replacement node an starts Cassandra in replace mode, which triggers the redistribution of the mirrored data in the Cassandra cluster.

More Details about [node eviction](https://github.com/mesosphere/kudo-cassandra-operator/blob/master/docs/evicting-nodes.md) and [failure handling](https://github.com/mesosphere/kudo-cassandra-operator/blob/master/docs/managing.md#failure-handling) can be found in the documentation.

## Multi-Datacenter Cluster

KUDO Cassandra allows to create Multi-Datacenter clusters. A single parameter, `NODE_TOPOLOGY` can be set e.g.:

```yaml
- datacenter: dc1
  datacenterLabels:
    failure-domain.beta.kubernetes.io/region: us-west-2
  nodes: 6
  rackLabelKey: failure-domain.beta.kubernetes.io/zone
  racks:
    - rack: rack1
      rackLabelValue: us-west-2a
    - rack: rack2
      rackLabelValue: us-west-2b
- datacenter: dc2
  datacenterLabels:
    failure-domain.beta.kubernetes.io/region: us-east-1
  nodes: 6
  rackLabelKey: failure-domain.beta.kubernetes.io/zone
  racks:
    - rack: rack3
      rackLabelValue: us-east-1a
    - rack: rack4
      rackLabelValue: us-east-1b
```

This will set up a Cassandra cluster with two rings of 12 nodes each. Each datacenter and each rack can have specific labels. The operator will set up a stateful set for each datacenter, create the correct `rack-dc.properties`, adjust the seed node configuration, etc.

Another option to set up a multi-dc cluster is to use `EXTERNAL_SEED_NODES` to connect two KUDO Cassandra clusters. In this case we would have to deploy two or more instances of KUDO Cassandra, and connect them via the parameter. 

The details on how to set up the different versions can be found in the [documentation](https://github.com/mesosphere/kudo-cassandra-operator/blob/master/docs/multidatacenter.md).

## Planned Features

There are a couple of planned features for KUDO Cassandra, although we are not fully sure about the priorities - If you're going to use or evaluate KUDO Cassandra, let us know what you like or need. 

* [Cassandra Reaper](http://cassandra-reaper.io/) for managing repair maintenance 
* Improvements to Backup & Restore for single nodes
* Automatic scale down and decommissioning
* Other improvements waiting for features in KUDO:

#### Toggle Tasks

[Toggle Tasks](https://kudo.dev/docs/developing-operators/tasks.html#toggle-task) were recently added to KUDO and allow easy feature toggles. Using it with the C* operator will allow us to simplify the operator structure a bit.

#### Immutable Parameters

There are a couple of parameters in KUDO Cassandra that are essentially immutable - for example, the `NUM_TOKENS` must not be changed after the Cassandra cluster is initialized. The [immutable parameters](https://github.com/kudobuilder/kudo/blob/main/keps/0030-immutable-parameters.md) which are planned for KUDO can be used to ensure that the value for those parameters will not be changed after the initial setup of the cluster.

#### Transient Parameters

[Transient parameters](https://github.com/kudobuilder/kudo/pull/1450) are another addition to KUDO that are in an early planning stage. At the moment it is not possible to provide transient values to triggered tasks, for example the name of a backup, or the name of a node for a repair job. We can work around that, but having this feature in KUDO would make it less error prone and clearer to use.

#### Parameter Dependencies

This is something that is not sketched out yet, but the use case is pretty obvious: There are a lot of parameters that only make sense if another parameter has a specific value - Setting the `BACKUP_PREFIX` when `BACKUP_RESTORE_ENABLED` isn't `true` does not make a lot of sense. This is again a quality-of-life feature that can prevent errors and provide help to users.

#### Yaml Object Validation

KUDO Cassandra uses a single YAML object parameter `NODE_TOPOLOGY` to set up a multi datacenter Cassandra cluster. The YAML in this parameter has to have a specific format, but KUDO currently doesn't have any way to verify the format of that parameter value. It might be possible to store that data in a CRD, or add YAML validation to KUDO.

#### The Recovery Controller

The recovery controller mentioned above is currently a part of KUDO Cassandra, but there is no specific reason for that. The functionality is generic and could be used for any kind of stateful workload. There might be an option to integrate the functionality into KUDO core, or to extract the recovery controller into a separate project that can be used by multiple operators.

#### Repeatable Tasks

As mentioned in the section about the multi datacenter setups, KUDO Cassandra currently uses one stateful set per datacenter. A better configuration would actually be one stateful set per rack, which would allow more customisation, different node counts per racks, more freedom with labels, etc. The [Issue](https://github.com/kudobuilder/kudo/issues/1481) proposes repeatable phases or steps which would allow a dynamic number of stateful sets per datacenter. It is a complex feature that might open up a lot of possibilities for operator developers. 

<Authors about="aneumann82" />
