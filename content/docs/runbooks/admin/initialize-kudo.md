# How to Initialize KUDO in a Cluster

The objective of this runbook is to initialize KUDO in a Kubernetes cluster.

## Preconditions

KUDO requires:

* Kubernetes 1.15+
* 100m [cpu](https://kubernetes.io/docs/concepts/configuration/manage-compute-resources-container/#meaning-of-cpu) and 50Mi [memory](https://kubernetes.io/docs/concepts/configuration/manage-compute-resources-container/#meaning-of-memory).

## Steps

### Initialize KUDO

`kubectl kudo init --wait`

::: info Wait Timout
There is an additional `--wait-timeout` parameter with a default of 300 seconds to adjust the wait timeout.
:::

This results in:

1. the deployment of KUDO CRDs
2. the creation of kudo-system namespace
3. deployment of the kudo controller
4. wait until the kudo controller is ready 

Output of a KUDO init will look like the following:

```bash
$ kubectl kudo init
✅ installed crds
✅ installed service accounts and other requirements for controller to run
✅ installed kudo controller
```
::: warning Wait is not a default
If you run `kubectl kudo init` without the `--wait` parameter, the command will return before all parts of KUDO are ready to serve requests. This can be problematic in test environments where the next KUDO command is executed without any delay. 

:::

### Check to see KUDO Manager is running

The installation of KUDO is verified by confirming that the `kudo-controller-manager-0` is in a running status.

```bash
$ kubectl get -n kudo-system pod
NAME                        READY   STATUS    RESTARTS   AGE
kudo-controller-manager-0   1/1     Running   0          11m
```
