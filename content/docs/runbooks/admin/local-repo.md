# How to host an Operator in a local repository
This explain how to host an operator repository on your local system.

## Preconditions

* You have built an operator package in `~/repo`
* You have python 3 installed
* KUDO is running on a Kubernetes cluster

## Steps

### Build Local Index File

```
# build local index file
kubectl kudo repo index ~/repo
```

### Run Repository HTTP Server

```
cd ~/repo
python -m http.server 80
```

### Add the local repository to KUDO client

```
kubectl kudo repo add local http://localhost
```

### Set the local repository to default KUDO context

`kubectl kudo repo context local`

### Confirm KUDO context

```
kubectl kudo repo list
NAME     	URL                                                  
community	https://kudo-repository.storage.googleapis.com/0.10.0
*local   	http://localhost     
```

The `*` next to local indicates that it is the default context for the KUDO client.

### Verify you are using the local repository for an installation

Using verbose CLI output it is possible to trace from where an operator is being installed from.  

`kubectl kudo install first-operator -v 9`

The output should look like:

```
kubectl kudo install first-operator -v 9
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
