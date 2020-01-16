# How to uninstall KUDO

The objective of this runbook is to completely uninstall KUDO from a kubernetes cluster.

## Preconditions

KUDO is initialized and running on a cluster.

## Steps

### Uninstall KUDO

`kubectl kudo init --dry-run --output yaml | kubectl delete -f-`

The follow is an example output of deleting the KUDO resources.

```
kubectl kudo init --dry-run --output yaml | kubectl delete -f-
customresourcedefinition.apiextensions.k8s.io "operators.kudo.dev" deleted
customresourcedefinition.apiextensions.k8s.io "operatorversions.kudo.dev" deleted
customresourcedefinition.apiextensions.k8s.io "instances.kudo.dev" deleted
namespace "kudo-system" deleted
serviceaccount "kudo-manager" deleted
clusterrolebinding.rbac.authorization.k8s.io "kudo-manager-rolebinding" deleted
```

### Check to see the KUDO Manager has been removed

```
kubectl get -n kudo-system pod
No resources found in kudo-system namespace.
```
