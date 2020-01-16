# How to package a KUDO operator

In order to distribute a KUDO operator the files are packaged together in a compressed tarball.  The KUDO CLI provides a mechanism to create this package format while verifying the integrity of the operator.

## Preconditions

* A KUDO operator has been created.  This runbook uses the [first-operator operator](https://github.com/kudobuilder/operators/tree/master/repository/first-operator) as defined in the [operators github repository](https://github.com/kudobuilder/operators).  It is expected that the working directory is from the base of the operator project.

* `tree` command is installed (used for confirmation only)

## Steps

### Package KUDO Operator

```bash
rm -rf ~/repo
mkdir -p ~/repo
kubectl kudo package create repository/first-operator/operator/ --destination=~/repo
```
::: warning Potential Data Loss
You may want to check the contents of the `~/repo` folder prior to deleting it.
:::

The output looks like:

```bash
kubectl kudo package create repository/first-operator/operator/ --destination=~/repo
package is valid
Package created: /Users/kensipe/repo/first-operator-0.2.0.tgz
```

### Check to see the operator is built

```bash
ls ~/repo
first-operator-0.2.0.tgz
```
