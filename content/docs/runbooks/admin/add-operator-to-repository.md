# How to add an Operator to a Repository

The following is the minimum steps necessary to add an operator to a repository.  This example uses the repository named "community", however you will want to use a repository for which you have admin rights.

## Preconditions

* You have read/write access to a web based server which hosts a repository.
* You have an operator package built (this runbook assumes the first-operator in ~/repo folder, as detailed in the [create operator runbook](create-operator))

## Steps

### Build an Index file

`kubectl kudo repo index ~/repo --merge-repo community --url-repo community`

This will download the current index from the community repository.  Add all operators in the `~/repo` folder to the index using the community url as the base location this operator will be hosted.

### Copy Artifacts to Repository

Copy all artifacts in the `~/repo` to the server.

::: tip Note
When updating a repository it is best to copy over all operator packages first, then update the index file.
:::
