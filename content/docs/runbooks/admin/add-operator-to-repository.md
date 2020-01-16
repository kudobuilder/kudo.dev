# How to add an Operator to a Repository

The following is the minimum steps necessary to an operator to a repository.  This example uses the repository named "community", however you will want to use a respository for which you have admin rights to.

## Preconditions

* You have read/write access to a web based server which hosts a respository.
* You have an operator package built (this runbook assumes the first-operator in ~/repo folder)

## Steps

### Build an Index file

```
kubectl kudo repo index ~/repo --merge-repo community --url-repo communit
```
This will download the current index from the community repository.  Add all operators in the `~/repo` folder to the index using the community url as the base location this operator will be hosted.

### Copy Artifacts to Repository

Copy all artifacts in the `~/repo` to the serve.
