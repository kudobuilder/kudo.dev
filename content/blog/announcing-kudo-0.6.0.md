---
date: 2019-09-09
---

# Announcing KUDO 0.6.0

We are proud to announce the release of KUDO v0.6.0! 

## Release Highlights

### kudo init command

With the new CLI installed you can now use `kubectl kudo init` command to setup a Kubernetes cluster with install version of KUDO and establish a KUDO_HOME on the client. To manage the details yourself, run `kubectl kudo init --dry-run -o=yaml`. Using the `--dry-run` flag will make no changes locally nor at the cluster, however the `-o=yaml` will output the YAML definitions for the server to STDOUT, making `kubectl kudo init --dry-run -o=yaml > kudo-install.yaml` an option.

KUDO v0.6.0 introduces the ability to use your own operator repository, details below. In order to configure KUDO to use a different repository it must be configured at the client. Assuming you already have KUDO installed in the cluster, run `kubectl kudo init --client-only` will establish the default KUDO repository options.

**TIP:** Looking to have the KUDO CLI "Wait" until KUDO is ready in the cluster? Try `kubectl kudo init --wait`.

Run `kubectl kudo init --help` for more details.

### KUDO Repository Management

KUDO 0.6.0 introduces the ability to manage repository options with the ability to Add, Remove and List repositories (details with `kubectl kudo repo`).

`kudo repo list` will provide a table of repository options with an `*` denoting the default or "current" repository.

```
kubectl kudo repo list
NAME      	URL                                           
*community	https://kudo-repository.storage.googleapis.com
```

### Repository Index Creation

Looking to create your own repository? This release provides `kubectl kudo repo index ...` which will create the `index.yaml` needed at a repository.  Assuming you have a folder `operators` will a set of operators, you simply run `kubectl kudo repo index operators url=http:/localhost:8080`. This assumes you will run a web server at port 8080 locally to use the repository.

### Selecting a Repository

All commands that need to interact with a repository (`install`, `upgrade`, etc.) now support a new flag `--repo`.  By default without using `--repo`, the current context repository will be used (denoted by `*` in `repo list`). `--repo` makes it possible to use another repository for a command without change the default context. Assuming a `test` repo, it is possible to install using `kubectl kudo install zookeeper --repo=test`.

### Creating an Operator Package

Newly add is the ability to create an operator tarball package from a folder with project defined naming conventions and some validation. Run `kubectl kudo package operator`, assuming operator is the folder of your operator. This will confirm the operator has a valid operator.yaml and params.yaml file and will create a foo-1.0.0.tgz, where foo is the name of the operator and 1.0.0 is the version. 

For more details run `kubectl kudo package --help`.

## Docker images

- `docker pull kudobuilder/controller:latest`
- `docker pull kudobuilder/controller:v0.6.0`

[Get started](../docs/README.md) with KUDO today. Our [community](../community/README.md) is ready for feedback to make KUDO even better!

