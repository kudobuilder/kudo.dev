# Runbooks

## Runbook Prerequisites

In order to be successful with all of the runbooks the following expectations must be met:

* [kubectl CLI](https://kubernetes.io/docs/tasks/tools/install-kubectl/) is installed and in the path.  To confirm the following command should execute successfully. ` kubectl version --client`
* [kubectl-kudo CLI](https://kudo.dev/docs/cli.html#setup-the-kudo-kubectl-plugin) is installed and in the path.  To confirm the following command should execute successfully.  `kubectl kudo version`
* The kubernetes context is set to an active cluster.  This can be confirmed with `kubectl version` and checking to see that a "Server Version" is provided as part of the respond.

Example kubectl version output

```
kubectl version
Client Version: version.Info{Major:"1", Minor:"17", GitVersion:"v1.17.0", GitCommit:"70132b0f130acc0bed193d9ba59dd186f0e634cf", GitTreeState:"clean", BuildDate:"2019-12-13T11:52:32Z", GoVersion:"go1.13.4", Compiler:"gc", Platform:"darwin/amd64"}
Server Version: version.Info{Major:"1", Minor:"17", GitVersion:"v1.17.0", GitCommit:"70132b0f130acc0bed193d9ba59dd186f0e634cf", GitTreeState:"clean", BuildDate:"2020-01-14T00:09:19Z", GoVersion:"go1.13.4", Compiler:"gc", Platform:"linux/amd64"}
```


## KUDO Runbooks

[KUDO Admin Runbooks](admin-runbooks.md)