# Operator Repository

The [KUDO CLI](cli.md) comes with a built-in official repository of verified Operators. Every time you use the `kudo install <operator>` command, it pulls the specified package from this repository. The packages are mirrored from the [KUDO Operators repository on Github](https://github.com/kudobuilder/operators).

## Layout

KUDO can work with any repository that conforms the expected structure and is exposed over HTTP. The official repository is hosted on Google Cloud Storage.

In the root of a repository we expect an `index.yaml` file similar to the following example:

```yaml
apiVersion: v1
entries:
  youroperator:
  - apiVersion: v1alpha1
    appVersion: 7.0.0
    name: youroperator
    urls:
    - https://kudo-repository.storage.googleapis.com/elastic-0.1.0.tgz
    version: 0.1.0
```

The `url` points to a location where a tarball package is hosted. These locations can be within the repository, or outside of it.

## Managing Packages

As of now, all official packages are mirrored from the [Github repository](https://github.com/kudobuilder/operators). To add new Operators, or to update an existing Operator, create a PR against that repository.
