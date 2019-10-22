---
date: 2019-09-09
---

# Announcing KUDO 0.6.0

KUDO v0.6.0 makes it more convenient than ever to create operator packages, and also comes with a bunch of features around repository management: you can now easily create and manage your own repositories, and select repositories to install operators from. We are proud to announce this release of KUDO v0.6.0!

<!-- more -->

To see the full changelog and the list of contributors who contributed to this release, visit [the Github Release](https://github.com/kudobuilder/kudo/releases/tag/v0.6.0) page.

## Release Highlights

### kudo init command

With the new CLI installed you can now use `kubectl kudo init` command to setup a Kubernetes cluster with install version of KUDO and establish a `KUDO_HOME` on the client. To manage the details yourself, run `kubectl kudo init --dry-run -o=yaml`. Using the `--dry-run` flag will make no changes locally nor at the cluster, however the `-o=yaml` will output the YAML definitions for the server to STDOUT, making `kubectl kudo init --dry-run -o=yaml > kudo-install.yaml` an option.

KUDO v0.6.0 introduces the ability to use your own operator repository, details below. In order to configure KUDO to use a different repository it must be configured at the client. Assuming you already have KUDO installed in the cluster, running `kubectl kudo init --client-only` will establish the default KUDO repository options.

**TIP:** Looking to have the KUDO CLI "Wait" until KUDO is ready in the cluster? Try `kubectl kudo init --wait`.

Run `kubectl kudo init --help` for more details.

### KUDO Repository Management

KUDO 0.6.0 introduces the ability to manage repository options with the ability to add, remove and list repositories (details with `kubectl kudo repo`).

`kudo repo list` will provide a table of repository options with an `*` denoting the default or "current" repository.

```bash
kubectl kudo repo list
NAME      	URL                                           
*community	https://kudo-repository.storage.googleapis.com
```

### Repository Index Creation

Looking to create your own repository? This release provides `kubectl kudo repo index ...` which will create the `index.yaml` needed at a repository.  Assuming you have a folder `operators` with a set of operators, you simply run `kubectl kudo repo index operators url=http://localhost:8080`. This assumes you will run a web server at port 8080 locally to use the repository.

### Selecting a Repository

All commands that interact with a repository (`install`, `upgrade`, etc.) now support a new flag `--repo`. Without using `--repo`, the current context repository will be used by default (denoted by `*` in `repo list`). `--repo` makes it possible to use another repository for a command without changing the default context. Assuming a `test` repo, it is possible to install using `kubectl kudo install zookeeper --repo=test`.

### Creating an Operator Package

Newly added is the ability to create an operator tarball package from a folder with project defined naming conventions and some validation. Run `kubectl kudo package operator`, assuming `operator` is the folder containing your operator. This requires that the operator has a valid operator.yaml and params.yaml file and will create a foo-1.0.0.tgz, where `foo` is the name of the operator and `1.0.0` is its version. 

For more details, run `kubectl kudo package --help`.

## Docker images

- `docker pull kudobuilder/controller:latest`
- `docker pull kudobuilder/controller:v0.6.0`

[Get started](../docs/README.md) with KUDO today. Our [community](../community/README.md) is ready for feedback to make KUDO even better!

