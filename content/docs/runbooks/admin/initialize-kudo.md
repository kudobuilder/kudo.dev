# How to Initialize KUDO in a Cluster

The objective of this runbook is to initialize KUDO in a Kubernetes cluster.

## Preconditions

KUDO requires:

* Kubernetes 1.15+
* 100m [cpu](https://kubernetes.io/docs/concepts/configuration/manage-compute-resources-container/#meaning-of-cpu) and 50Mi [memory](https://kubernetes.io/docs/concepts/configuration/manage-compute-resources-container/#meaning-of-memory).

## Steps

### Initialize KUDO

`kubectl kudo init --wait`

This results in:

1. the deployment of KUDO CRDs
2. the creation of kudo-system namespace
3. deployment of the kudo controller

Output of a KUDO init will look like the following:

```bash
$ kubectl kudo init
✅ installed crds
✅ installed service accounts and other requirements for controller to run
✅ installed kudo controller
```

### Check to see KUDO Manager is running

The installation of KUDO is verified by confirming that the `kudo-controller-manager-0` is in a running status.

```bash
$ kubectl get -n kudo-system pod
NAME                        READY   STATUS    RESTARTS   AGE
kudo-controller-manager-0   1/1     Running   0          11m
```
