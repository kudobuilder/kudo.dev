# KUDO Admin Runbooks

## How to install KUDO

The objective of this runbook is to initialize a kubernetes cluster with KUDO.

### Preconditions
KUDO requires:

*  kubernetes 1.15+
*  100m [cpu](https://kubernetes.io/docs/concepts/configuration/manage-compute-resources-container/#meaning-of-cpu) and 50Mi [memory](https://kubernetes.io/docs/concepts/configuration/manage-compute-resources-container/#meaning-of-memory).

### Steps

#### Initialize KUDO
```
kubectl kudo init --wait

```

This results in:

1. the deployment of KUDO CRDs
2. the creation of kudo-system namespace
3. deployment of the kudo controller

Output of a KUDO init will look like the following: 

```
$ kubectl kudo init
✅ installed crds
✅ installed service accounts and other requirements for controller to run
✅ installed kudo controller
```


#### Check to see KUDO Manager is running

The installation of KUDO is verified by confirm that the `kudo-controller-manager-0` is in a running status.

```
kubectl get -n kudo-system pod
NAME                        READY   STATUS    RESTARTS   AGE
kudo-controller-manager-0   1/1     Running   0          11m
```


## How to uninstall KUDO
The objective of this runbook is to complete uninstall KUDO from a kubernetes cluster. 

### Preconditions

KUDO is initialized and running on a cluster.

### Steps

#### Uninstall KUDO 

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

#### Check to see the KUDO Manager has been removed

```
kubectl get -n kudo-system pod
No resources found in kudo-system namespace.
```


## How to package a KUDO operator
In order to distribute a KUDO operator the files are packaged together in compressed tarball.  The KUDO cli provides a mechanism to create this package format while verifying the integrity of the operator.

### Preconditions

A KUDO operator has been created.  This runbook uses the [first-operator operator](https://github.com/kudobuilder/operators/tree/master/repository/first-operator) in the [operators github repository](https://github.com/kudobuilder/operators).  It is expected that the working directory is from the base of the operator project.

### Steps

#### Package KUDO Operator

```
rm -rf ~/repo
mkdir ~/repo
kubectl kudo package create repository/first-operator/operator/ --destination=~/repo
```


The output looks like:

```
kubectl kudo package create repository/first-operator/operator/ --destination=~/repo
package is valid
Package created: /Users/kensipe/repo/first-operator-0.2.0.tgz
```

#### Check to see the operator is built

```
ls ~/repo
first-operator-0.2.0.tgz
```

## How to add an Operator to a Repository

The following is the minimum steps necessary to an operator to a repository.  This example uses the repository named "community", however you will want to use a respository for which you have admin rights to.

### Preconditions

* You have read/write access to a web based server which hosts a respository.
* You have an operator package built (this runbook assumes the first-operator in ~/repo folder)

### Steps


#### Build an Index file

```
kubectl kudo repo index ~/repo --merge-repo community --url-repo communit
```
This will download the current index from the community repository.  Add all operators in the `~/repo` folder to the index using the community url as the base location this operator will be hosted.

#### Copy Artifacts to Repository

Copy all artifacts in the `~/repo` to the serve. 


## How to host an Operator in a local repository
This explain how to host an operator repository on your local system.

### Preconditions

* You have built an operator package in `~/repo`
* You have python 3 installed
* KUDO is running on a Kubernetes cluster

### Steps

#### Build Local Index File

```
# build local index file
kubectl kudo repo index ~/repo
```

#### Run Repository HTTP Server

```
cd ~/repo
python -m http.server 80
```

#### Add the local repository to KUDO client

```
kubectl kudo repo add local http://localhost
```

#### Set the local repository to default KUDO context

`kubectl kudo repo context local`

#### Confirm KUDO context

```
kubectl kudo repo list
NAME     	URL                                                  
community	https://kudo-repository.storage.googleapis.com/0.10.0
*local   	http://localhost     
```

The `*` next to local indicates that it is the default context for the KUDO client.

#### Verify you are using the local repository for an installation

Using verbose CLI output it is possible to trace from where an operator is being installed from.  

`kubectl kudo install first-operator -v 9`

The output should look like:

```
k kudo install first-operator -v 9
repo configs: { name:community, url:https://kudo-repository.storage.googleapis.com/0.10.0 },{ name:local, url:http://localhost }

repository used { name:local, url:http://localhost }
configuration from "/Users/kensipe/.kube/config" finds host https://127.0.0.1:32768
acquiring kudo client
getting package crds
no local operator discovered, looking for http
no http discovered, looking for repository
getting package reader for first-operator, _
repository using: { name:local, url:http://localhost }
attempt to retrieve package from url: http://localhost/first-operator-0.2.0.tgz
first-operator is a repository package from { name:local, url:http://localhost }
operator name: first-operator
operator version: 0.2.0
parameters in use: map[]
operator.kudo.dev/first-operator unchanged
instance first-operator-instance created in namespace default
instance.kudo.dev/v1beta1/first-operator-instance created
```

You will also see in terminal running python http.server the following:

```
127.0.0.1 - - [14/Jan/2020 07:59:24] "GET /index.yaml HTTP/1.1" 200 -
127.0.0.1 - - [14/Jan/2020 07:59:24] "GET /first-operator-0.2.0.tgz HTTP/1.1" 200 -
```

## How to Create an Operator from Scratch
This is a step-by-step walk through of the creation of an operator using the KUDO cli to generate the operator structure.

### Preconditions

None

#### Create the Core Operator Structure

```
# create operator folder
mkdir first-operator
cd first-operator
kubectl kudo package new first-operator
```

This creates the main structure of the operator which can be view with `tree`

```
tree .
.
└── operator
    ├── operator.yaml
    └── params.yaml
```

**note:** use the `-i` mode to be prompted interactively for operator details.

#### Add a Maintainer

`kubectl kudo package add maintainer "your name" your@email.com`

#### Add a Task

`kubectl kudo package add task`

This will go into interactive mode.  Here is an example interaction.

```
kubectl kudo package add task
Task Name: app
✔ Apply
Task Resource: deployment
✗ Add another Resource: 
```

#### Add a Plan

`kubectl kudo package add plan`

This will go into interactive mode.  Here is an example interaction.

```
kubectl kudo package add plan
✔ Plan Name: deploy
✔ serial
Phase 1 name: main
✔ parallel
Step 1 name: everything
✔ app
✗ Add another Task: 
✗ Add another Step: 
✗ Add another Phase: 
```

#### Add a Parameter

`kubectl kudo package add parameter`

This will go into interactive mode.  Here is an example interaction.

```
kubectl kudo package add parameter
Parameter Name: replicas
Default Value: 2
Display Name: 
Description: Number of replicas that should be run as part of the deployment
✔ false
✗ Add Trigger Plan: 
```

These steps have created the entirety of the first-operator with the exception of the details in the `template/deployment.yaml` file.  To complete this operator execute the following.

```
cat << EOF > operator/templates/deployment.yaml 
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deployment
spec:
  selector:
    matchLabels:
      app: nginx
  replicas: {{ .Params.replicas }}
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
        - name: nginx
          image: nginx:1.7.9
          ports:
            - containerPort: 80
EOF
```

