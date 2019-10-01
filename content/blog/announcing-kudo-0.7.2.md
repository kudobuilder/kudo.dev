---
date: 2019-10-01
---

# Announcing KUDO 0.7.2

KUDO v0.7.0+ focuses on developer productivity, user debugging, Kubernetes controller best practices and is updated to the latest Kubernetes 1.16 standards. We are happy to announce the release of v0.7.2.


<!-- more -->


## Release Highlights

### kudo init command

The KUDO init command was added in 0.6.0, however there were times in tests where we needed just the crds. This resulted in parsing the init output or maintaining a separate copy of the CRDs.  KUDO v0.7.0 now allows for the creation of the CRDs only with `kubectl kudo init --crd-only`.  When used in conjunction with other flags and piped to other commands can add some real value.  Examples:

`kubectl kudo init --dry-run --crd-only -o yaml | kubectl delete -f -` will delete the CRDs from the cluster.

Run `kubectl kudo init --help` for more details.


### Repository Index Creation

KUDO v0.6.0 introduced the ability to create a repository index such as `kubectl kudo repo index ...` which will create the `index.yaml` needed at a repository.  KUDO v0.7.0 now makes it possible to "merge" an existing repository index file from a remote repository and merge it with the creation of a local index. The local operators will take precedence over existing operators with the same name and version. This can be accomplished with one of two flags `--merge` and `--merge-repo`.  `--merge` takes the full url of the repository, while `--merge-repo` takes the name of a repository from the repositories defined in `kubectl kudo repo list`; the default repository name being "community".

Assuming a folder named new_repo with packaged operators in it, the following will create an index merged with the community index file.
`kubectl kudo repo index new_repo --merge-repo community`.

An additional update this release is the use of the url defined in the index file for the retrieval of the operator.  Now a local repository with an URL entry for the operator of "https://kudo-repository.storage.googleapis.com/mysql-0.1.0.tgz" will now download from that url. While this was intended for sometime it is now implemented in v0.7.0.

### Removal of PlanExecution CRD

KUDO's handling of plans has been completely refactored resulting in the removal of plan execution as a CRD type.  Plans are now part of the instance.

Based on this refactor, `kudo plan history` is temporarily removed and will return in a future release.

### Verbose CLI Debug Output

KUDO now provides functionality for verbosity similar to that which is expected with Kubernetes with a `-v` or `--v`. It has not been fully integrated across all CLI commands yet. It is complete with `kudo install -v 9` where `-v 9` will provide the maximum resolution of debug tracing.

```
kubectl kudo install zookeeper -v 9
repository used &{0xc0002d8460 {0xc0002c4ea0}}
acquiring kudo client
getting package crds
no local operator discovered, looking for http
no http discovered, looking for repository
getting package reader for zookeeper,
repository using: &{https://kudo-repository.storage.googleapis.com community}
attempt to retrieve package from url: https://kudo-repository.storage.googleapis.com/zookeeper-0.1.0.tgz
operator name: zookeeper
operator version: 0.1.0
parameters in use: map[]
operator.kudo.dev/zookeeper does not exist

operator.kudo.dev/v1alpha1/zookeeper created

operatorversion.kudo.dev/v1alpha1/zookeeper-0.1.0 created

instance zookeeper-v7s9gg created in namespace default
instance.kudo.dev/v1alpha1/zookeeper-v7s9gg created
```

### Built on Go 1.13.1

Go 1.13.1 provided a security release for [an issue](https://github.com/golang/go/issues/34542) which did NOT affect KUDO.  Regardless we have upgraded to 1.13.1 for this build.

### Updated to Latest Kubernetes API

StatefulSets in KUDO were previously accessed through v1beta2 APIs which has been removed from Kubernetes 1.16. Now KUDO uses the AppsV1 API.


## Docker images

- `docker pull kudobuilder/controller:latest`
- `docker pull kudobuilder/controller:v0.7.2`

[Get started](../docs/README.md) with KUDO today. Our [community](../community/README.md) is ready for feedback to make KUDO even better!
