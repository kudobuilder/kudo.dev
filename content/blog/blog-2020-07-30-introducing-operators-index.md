---
date: 2020-07-30
---

# Introducing the KUDO Operators Index

The default repository when installing operators with KUDO is the community repository. Adding new operators to this repository has been greatly simplified with a new index of operators and a new community repository URL that is used starting with KUDO 0.16.

<!-- more -->

Adding new operators to the community repository was traditionally done by adding the operator packages as a folder in the [operators](https://github.com/kudobuilder/operators) project. While this worked well for smaller operators, it created challenges for large operators, for example, [KUDO Cassandra](https://github.com/mesosphere/kudo-cassandra-operator). Larger operators are developed as separate projects in their own git repository. For new releases, the operator package would have to be copied over to the _operators_ project. In case of bugs in the operator, is the source of truth now the origin project or the folder in the _operators_ project?

To avoid these and other challenges, the new [Operators Index](https://github.com/kudobuilder/operators-index) provides a simple way to reference operator packages located in external projects. Instead of copying an operator package, operator developers reference the URL of a git repository and the operator packages included in that git repository.

With these references, there's a one-to-one mapping of operator packages included by a git repository and the respective packages in KUDO's community repository. Every entry in the _Operators Index_ results in a package in the community repository.

## Adding operator packages to the _Operators Index_

To add an operator package, create a pull request that adds or updates an index entry in the [operators](https://github.com/kudobuilder/operators-index/tree/main/operators) folder of the [Operators Index](https://github.com/kudobuilder/operators-index). Each entry in the index references versions of an operator package.
By creating a pull request that adds or updates an entry, the referenced operator packages are validated as part of a CI job. This is similar to running `kubectl kudo package verify` on the operator package. Additional checks confirm that the metadata of the entry matches the respective metadata of the operator package.

Once the pull request is approved and merged, the community repository is rebuild and the package will be available to users.

### Adding Tagged versions from a git repository

Say you have an operator developed in a git repository. In this git repository you run tests, provide documentation and bundle the actual operator package. You use tags to release new versions of this operator.

The following YAML would add an example operator "My Operator" from a GitHub repository to the index. The operator package is in the `operator` folder of this repository and a tag for version 1.0.0 exists.

```yaml
apiVersion: index.kudo.dev/v1alpha1
kind: Operator
name: My Operator
gitSources:
  - name: my-operator
    url: https://github.com/example/my-operator.git
versions:
  - operatorVersion: "1.0.0"
    git:
      source: my-operator
      directory: operator
      tag: v1.0.0
```

[The entry for the KUDO Cassandra operator uses this approach.](https://github.com/kudobuilder/operators-index/blob/main/operators/cassandra.yaml)

### Adding specific commits from a git repository

Sometimes, one doesn't have tags for a specific operator. For example when multiple operators share a git repository. In this case, one can reference the SHA of a specific commit instead of a tag.

```yaml
apiVersion: index.kudo.dev/v1alpha1
kind: Operator
name: My Operator
gitSources:
  - name: my-operator
    url: https://github.com/example/my-operator.git
versions:
  - operatorVersion: "1.0.0"
    git:
      source: my-operator
      directory: operator
      sha: 2b5b8ae28a83eb171d1c3094b92a1cc07e8c26f4
```

[The entry for the MySQL operator uses this approach.](https://github.com/kudobuilder/operators-index/blob/main/operators/mysql.yaml)

### Adding tarballs

If is also possible to reference a tarball of an operator package if there isn't a git repository. The tarball will be copied into the community repository once this entry is merged.

```yaml
apiVersion: index.kudo.dev/v1alpha1
kind: Operator
name: My Operator
versions:
  - operatorVersion: "1.0.0"
    url: https://example.org/my-operator-1.0.0.tgz
```

## Summary

The new [Operators Index](https://github.com/kudobuilder/operators-index) provides a one-to-one mapping of referenced operators and packages in the community repository. This makes it convenient for operator developers to add operator packages hosted in git repositories to KUDO's community repository.

<Authors about="nfnt" />
