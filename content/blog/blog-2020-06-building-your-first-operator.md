---
date: 2020-04-22
---

# Building your first KUDO operator - Part 1

So you’ve been using KUDO, tried some of the operators in the upstream repository, and now you want to write an operator for your own application. How do you go about doing that ? 

In this series of blog posts, I’m going to take you through writing a KUDO operator for [Galera](https://galeracluster.com/), an open source clustering solution for [MariaDB](https://mariadb.org/).

<!-- more -->

## Setting up your environment

Firstly, let’s get our development and test environment created. We’ll need a Kubernetes cluster for testing purposes, I usually find it easier to use [Kind](https://kubernetes.io/docs/setup/learning-environment/kind/) to do this locally on my laptop, although this is very much dependent on how much resource you have on your machine, and how big your operator is likely to be. For a bigger operator, you may want to test in the cloud on a bigger cluster.

As part of the development process you’ll usually want to uninstall and reinstall your operator repeatedly, so it’s easiest to be able to uninstall all KUDO related resources from your cluster when you do this, to ensure a clean testing environment. You can find out how to do this [here](https://kudo.dev/docs/runbooks/admin/remove-kudo.html)

Finally if you haven't already got it installed, you'll need the [KUDO CLI extension](https://kudo.dev/docs/cli.html) for kubectl. 

### Create the filesystem layout

The first thing we need to do is create the filesystem layout which our operator will need. For KUDO operators, there is a standard layout which all operators share - we need a folder called operator, and inside that two top level yaml files, operator.yaml and params.yaml,  and a folder called templates. 

Firstly make a top level directory :

```
MacBook-Pro:~ matt$ mkdir galera
```

Then we’ll change into that directory. Now we could manually create the filesystem layout, but if we’ve got the KUDO kubectl extension installed, then we can use the *package new* command to create it for us. 

```
MacBook-Pro:~ matt$ cd galera
MacBook-Pro:galera matt$ kubectl kudo package new galera
MacBook-Pro:galera matt$ ls
operator
MacBook-Pro:galera matt$ tree
.
└── operator
    ├── operator.yaml
    └── params.yaml

1 directory, 2 files
```

If we look at the top level yaml files which have been created, they have populated some of the fields for us, but we’ll need to populate some of the others. The CLI extension can do some of this for you, but in the interests of understanding what is going on, in this blog we'll do it manually :

```yaml
apiVersion: kudo.dev/v1beta1
kudoVersion: 0.12.0
name: galera
operatorVersion: 0.1.0
plans: {}
tasks: []
MacBook-Pro:operator matt$ cat params.yaml 
apiVersion: kudo.dev/v1beta1
parameters: []
```

In our operator,yaml, the first things we’ll populate is the metadata, to add our maintainer details, and the metadata about the application itself. We can also add the version of Kubernetes that our operator is targeting. 

```yaml
apiVersion: kudo.dev/v1beta1
kudoVersion: 0.12.0
operatorVersion: 0.1.0
kubernetesVersion: 1.17.0
appVersion: 10.5.3
maintainers:
- email: matt@mattjarvis.org.uk
  name: Matt Jarvis
name: galera
url: https://mariadb.com/
operatorVersion: 0.1.0
```

Here you can see I’ve added the url of the application, the version of the app the operator was written against, as well as my details, and the version of Kubernetes I’m using. 

We also need to create our templates directory, which isn’t created automatically by the CLI. 

```
MacBook-Pro:operator matt$ mkdir templates
MacBook-Pro:operator matt$ tree
.
├── operator.yaml
├── params.yaml
└── templates

1 directory, 2 files
```

### Create a deploy plan

All KUDO operators must have a deploy plan, so let’s also create the skeleton for that in our operator.yaml :

```yaml
apiVersion: kudo.dev/v1beta1
kudoVersion: 0.12.0
operatorVersion: 0.1.0
kubernetesVersion: 1.17.0
appVersion: 10.5.3
maintainers:
- email: matt@mattjarvis.org.uk
  name: Matt Jarvis
name: galera
url: https://mariadb.com/
operatorVersion: 0.1.0
plans:
  deploy:
    strategy: serial
    phases:
      - name: deploy
        strategy: serial
        steps:
tasks:
```

## Bootstrap configuration

When we deploy a Galera cluster, there are specific steps we need to take in order to bootstrap. We first need a bootstrap node, which will have different configuration from the rest of the cluster, and from which our remaining nodes are going to join to form the cluster.

In order to deploy that bootstrap node, the first thing we’ll need is the configuration for it. I’m going to use a ConfigMap resource to pass this into my bootstrap container. Firstly, I’ll add a step and task to the deploy phase of my deploy plan, and I’ll add the configuration for that task which will refer to a YAML file in my templates directory, and define the task as an Apply task, which will just apply that YAML file to our cluster :

```yaml
apiVersion: kudo.dev/v1beta1
kudoVersion: 0.12.0
operatorVersion: 0.1.0
kubernetesVersion: 1.17.0
appVersion: 10.5.3
maintainers:
- email: matt@mattjarvis.org.uk
  name: Matt Jarvis
name: galera
url: https://mariadb.com/
operatorVersion: 0.1.0
plans:
  deploy:
    strategy: serial
    phases:
      - name: deploy
        strategy: serial
        steps:
          - name: bootstrap_config
            tasks:
              - bootstrap_config
tasks:
    - name: bootstrap_config
      kind: Apply
      spec:
        resources:
          - bootstrap_config.yaml

```

Now we have the KUDO configuration for this task in place, let’s go ahead and create the bootstrap_config.yaml file. 

```
MacBook-Pro:templates matt$ cat bootstrap_config.yaml 
apiVersion: v1
kind: ConfigMap
metadata:
  name: {{ .Name }}-bootstrap
  namespace: {{ .Namespace }}
data:
  galera.cnf: |
    [galera]
    wsrep_on = ON
    wsrep_provider = /usr/lib/galera/libgalera_smm.so
    wsrep_sst_method = mariabackup
    wsrep_cluster_address = gcomm://
    wsrep_sst_auth = "{{ .Params.SST_USER }}:{{ .Params.SST_PASSWORD }}"
    binlog_format = ROW
```

As we can see this YAML file is a ConfigMap resource, which contains a single data section called galera.cnf, with the configuration we need for Galera. The bootstrap specific configuration here is the wsrep_cluster_address, which indicates that this will be a bootstrap node :

```
wsrep_cluster_address = gcomm://
```

The other important lines is this YAML file are the three which will be templated by KUDO on instantion. Firstly we have the name and namespace lines :

```
  name: {{ .Name }}-bootstrap
  namespace: {{ .Namespace }}
```

The .Name variable is unique to each KUDO instance, and since you can’t have instances with the same name in a cluster, this ensures our ConfigMap resource is also unique. We must also namespace all of our KUDO objects, so this gets set by KUDO. 

Finally we need to set credentials to be used internally in the Galera cluster for synchronization between nodes :

```
wsrep_sst_auth = "{{ .Params.SST_USER }}:{{ .Params.SST_PASSWORD }}"
```

Here we are referring to two parameters which will be defined in our params.yaml file, so let’s go and add those to our parameters file. 

```yaml
apiVersion: kudo.dev/v1beta1
parameters:
  - name: SST_USER
    description: "User to perform SST as"
    default: "root"
  - name: SST_PASSWORD
    description: "Password for SST user"
    default: "admin"
```

So here we have defined the two parameters we need, added a description, and given them default values. 

NOTE: For an real world operator it would be better to store the SST_PASSWORD in a separate `Secret` resource that can be provided by the user - when a simple KUDO parameter is used, the value of that parameter is not encrypted in any way and may easily be read from the cluster.


### First Test

At this point, we want to now test that this part of our operator works correctly. First let’s install KUDO :

```
MacBook-Pro:operator matt$ kubectl kudo init
$KUDO_HOME has been configured at /Users/matt/.kudo
✅ installed crds
✅ installed service accounts and other requirements for controller to run
✅ installed kudo controller
```

And now let’s install our operator. The KUDO CLI extension allows me to install directly from the local filesystem, so from our operator directory :

```
MacBook-Pro:operator matt$ kubectl kudo install .
operator.kudo.dev/v1beta1/galera created
operatorversion.kudo.dev/v1beta1/galera-0.1.0 created
instance.kudo.dev/v1beta1/galera-instance created
```

And now let’s see what the status of our deploy plan is. Since I didn't specify a name when I installed my operator, our instance automatically gets assigned the name *galera-instance* : 

```
MacBook-Pro:operator matt$ kubectl kudo plan status --instance=galera-instance
Plan(s) for "galera-instance" in namespace "default":
.
└── galera-instance (Operator-Version: "galera-0.1.0" Active-Plan: "deploy")
    └── Plan deploy (serial strategy) [COMPLETE], last updated 2020-06-23 14:10:39
        └── Phase deploy (serial strategy) [COMPLETE]
            └── Step bootstrap_config [COMPLETE]
```


Now we are expecting that plan to have created a ConfigMap resource, and for our templating to have configured it correctly. First let’s see if the ConfigMap exists :

```
MacBook-Pro:operator matt$ kubectl get configmaps
NAME                        DATA   AGE
galera-instance-bootstrap   1      2m1s
```

So the ConfigMap has been created correctly, and you can see that it’s been named using the .Name variable as we configured in the bootstrap_config.yaml. Let’s take a look at the content :

```
MacBook-Pro:operator matt$ kubectl describe configmap galera-instance-bootstrap
Name:         galera-instance-bootstrap
Namespace:    default
Labels:       heritage=kudo
              kudo.dev/instance=galera-instance
              kudo.dev/operator=galera
Annotations:  kudo.dev/last-applied-configuration:
                {"kind":"ConfigMap","apiVersion":"v1","metadata":{"name":"galera-instance-bootstrap","namespace":"default","creationTimestamp":null,"label...
              kudo.dev/last-plan-execution-uid: 639dff2a-d3eb-4d7c-a07f-dd8c1518c7fd
              kudo.dev/operator-version: 0.1.0
              kudo.dev/phase: deploy
              kudo.dev/plan: deploy
              kudo.dev/step: bootstrap_config

Data
====
galera.cnf:
----
[galera]
wsrep_on = ON
wsrep_provider = /usr/lib/galera/libgalera_smm.so
wsrep_sst_method = mariabackup
wsrep_cluster_address = gcomm://
wsrep_sst_auth = "root:admin"
binlog_format = ROW

Events:  <none>
```

As we can see it’s been correctly created, with the parameters from the params.yaml templated into it. 

At this point, we’ll want to remove all of our operator from our test cluster so we can add the next steps and re-test. The easiest way to do that is just to uninstall KUDO and all of its resources :

```
MacBook-Pro:operator matt$ kubectl kudo init --dry-run --output yaml | kubectl delete -f -
customresourcedefinition.apiextensions.k8s.io "operators.kudo.dev" deleted
customresourcedefinition.apiextensions.k8s.io "operatorversions.kudo.dev" deleted
customresourcedefinition.apiextensions.k8s.io "instances.kudo.dev" deleted
namespace "kudo-system" deleted
serviceaccount "kudo-manager" deleted
clusterrolebinding.rbac.authorization.k8s.io "kudo-manager-rolebinding" deleted
service "kudo-controller-manager-service" deleted
statefulset.apps "kudo-controller-manager" deleted
```

## Bootstrap service

The next thing we are going to need is a service defined, so that our cluster nodes can connect to our bootstrap node once they are deployed. Firstly we’ll define that step and task in our operator.yaml, as well as defining the resources for the task. Once again this will be an Apply task, just applying the resource to our cluster :

```yaml
plans:
  deploy:
    strategy: serial
    phases:
      - name: deploy
        strategy: serial
        steps:
          - name: bootstrap_config
            tasks:
              - bootstrap_config
          - name: bootstrap_service
            tasks:
              - bootstrap_service
tasks:
    - name: bootstrap_config
      kind: Apply
      spec:
        resources:
          - bootstrap_config.yaml
    - name: bootstrap_service
      kind: Apply
      spec:
        resources:
          - bootstrap_service.yaml
```

Now we have our KUDO configuration, we need to create the bootstrap_service.yaml for the task. 

```yaml
apiVersion: v1
kind: Service
metadata:
  name: {{ .Name }}-bootstrap-svc
  namespace: {{ .Namespace }}
  labels:
    app: galera-bootstrap
spec:
  ports:
    - port: {{ .Params.MYSQL_PORT }}
      name: mysql
    - port: {{ .Params.SST_PORT }}
      name: sst 
    - port: {{ .Params.REPLICATION_PORT }}
      name: replication
    - port: {{ .Params.IST_PORT }}
      name: ist 
  selector:
    app: galera-bootstrap
    instance: {{ .Name }}
  clusterIP: None
```

Again here, we’ve made sure the name will be unique, and we’ve set a label which we’ll use to manage which instances use this service. We’ve defined all the ports which Galera uses, and assigned their values to parameters in our params.yaml file, and defined a selector which will match our bootstrap instance when we define that. For this particular service, we know only one instance will ever use it, so we don’t need a clusterIP, the service can be headless and Kubernetes can just create the relevant DNS endpoint. 

Now we’ve got that file in place, let’s add those parameters to our params.yaml :

```yaml
apiVersion: kudo.dev/v1beta1
parameters:
  - name: SST_USER
    description: "User to perform SST as"
    default: "root"
  - name: SST_PASSWORD
    description: "Password for SST user"
    default: "admin"
  - name: MYSQL_PORT
    description: "MySQL port"
    default: "3306"
  - name: SST_PORT
    description: "SST port"
    default: "4444"
  - name: REPLICATION_PORT
    description: "Replication port"
    default: "4567"
  - name: IST_PORT
    description: "IST port"
    default: "4568"
```

Now we’ve got our second step defined, let’s go ahead and test our operator again. 

```

MacBook-Pro:operator matt$ kubectl kudo init
$KUDO_HOME has been configured at /Users/matt/.kudo
✅ installed crds
✅ installed service accounts and other requirements for controller to run
✅ installed kudo controller
MacBook-Pro:operator matt$ kubectl kudo install .
operator.kudo.dev/v1beta1/galera created
operatorversion.kudo.dev/v1beta1/galera-0.1.0 created
instance.kudo.dev/v1beta1/galera-instance created
MacBook-Pro:operator matt$ kubectl kudo plan status --instance galera-instance
Plan(s) for "galera-instance" in namespace "default":
.
└── galera-instance (Operator-Version: "galera-0.1.0" Active-Plan: "deploy")
    └── Plan deploy (serial strategy) [COMPLETE], last updated 2020-06-23 14:27:06
        └── Phase deploy (serial strategy) [COMPLETE]
            ├── Step bootstrap_config [COMPLETE]
            └── Step bootstrap_service [COMPLETE]
```

From the output of *plan status*, we can see that both of our steps have been completed. Let’s check if the service configuration is correct :

```
MacBook-Pro:operator matt$ kubectl get services
NAME                            TYPE        CLUSTER-IP   EXTERNAL-IP   PORT(S)                               AGE
galera-instance-bootstrap-svc   ClusterIP   None         <none>        3306/TCP,4444/TCP,4567/TCP,4568/TCP   39s
```

Here we can see the service has been created, and has the correct ports from our params.yaml definitions. Let’s take a look in detail at it :

```
MacBook-Pro:operator matt$ kubectl describe service galera-instance-bootstrap-svc
Name:              galera-instance-bootstrap-svc
Namespace:         default
Labels:            app=galera-bootstrap
                   heritage=kudo
                   kudo.dev/instance=galera-instance
                   kudo.dev/operator=galera
Annotations:       kudo.dev/last-applied-configuration:
                     {"kind":"Service","apiVersion":"v1","metadata":{"name":"galera-instance-bootstrap-svc","namespace":"default","creationTimestamp":null,"lab...
                   kudo.dev/last-plan-execution-uid: bb00273a-c89d-4464-910e-556a7e0ff2fe
                   kudo.dev/operator-version: 0.1.0
                   kudo.dev/phase: deploy
                   kudo.dev/plan: deploy
                   kudo.dev/step: bootstrap_service
Selector:          app=galera-bootstrap,instance=galera-instance
Type:              ClusterIP
IP:                None
Port:              mysql  3306/TCP
TargetPort:        3306/TCP
Endpoints:         <none>
Port:              sst  4444/TCP
TargetPort:        4444/TCP
Endpoints:         <none>
Port:              replication  4567/TCP
TargetPort:        4567/TCP
Endpoints:         <none>
Port:              ist  4568/TCP
TargetPort:        4568/TCP
Endpoints:         <none>
Session Affinity:  None
Events:            <none>
```

We can see the label has been created correctly, the ports are all correct, and at this point we have no endpoints, which is expected since we don’t yet have an actual instance of our bootstrap node using this service. 

As before, uninstall our operator, and let’s move onto the next steps. 

## Deploy the bootstrap node

The final step we need for bootstrapping is to deploy an actual instance of our bootstrap node, using our config and service. As before, let’s add steps and tasks to our operator.yaml :

```
plans:
  deploy:
    strategy: serial
    phases:
      - name: deploy
        strategy: serial
        steps:
          - name: bootstrap_config
            tasks:
              - bootstrap_config
          - name: bootstrap_service
            tasks:
              - bootstrap_service
          - name: bootstrap_deploy
            tasks:
              - bootstrap_deploy
tasks:
    - name: bootstrap_config
      kind: Apply
      spec:
        resources:
          - bootstrap_config.yaml
    - name: bootstrap_service
      kind: Apply
      spec:
        resources:
          - bootstrap_service.yaml
    - name: bootstrap_deploy
      kind: Apply
      spec:
        resources:
          - bootstrap_deploy.yaml
```

Now we’ll create the bootstrap_deploy.yaml template :

```
MacBook-Pro:templates matt$ cat bootstrap_deploy.yaml 
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ .Name }}-bootstrap
  namespace: {{ .Namespace }}
  labels:
    app: galera-bootstrap
    instance: {{ .Name }}
spec:
  selector:
    matchLabels:
      app: galera-bootstrap
      instance: {{ .Name }}
  strategy:
    type: Recreate
  template:
    metadata:
      labels:
        app: galera-bootstrap
        instance: {{ .Name }}
    spec:
      containers:
      - image: mariadb:latest
        name: mariadb
        args:
        - "--ignore_db_dirs=lost+found"
        env:
          # Use secret in real usage
        - name: MYSQL_ROOT_PASSWORD
          value: {{ .Params.MYSQL_ROOT_PASSWORD }}
        ports:
        - containerPort: {{ .Params.MYSQL_PORT }}
          name: mysql
        - containerPort: {{ .Params.SST_PORT }}
          name: sst
        - containerPort: {{ .Params.REPLICATION_PORT }}
          name: replication
        - containerPort: {{ .Params.IST_PORT }}
          name: ist
        livenessProbe:
          exec:
            command: ["mysqladmin", "-p{{ .Params.MYSQL_ROOT_PASSWORD }}", "ping"]
          initialDelaySeconds: 30
          periodSeconds: 10
          timeoutSeconds: 5
        readinessProbe:
          exec:
            # Check we can execute queries over TCP (skip-networking is off).
            command: ["mysql", "-p{{ .Params.MYSQL_ROOT_PASSWORD }}", "-h", "127.0.0.1", "-e", "SELECT 1"]
          initialDelaySeconds: 5
          periodSeconds: 2
          timeoutSeconds: 1
        volumeMounts:
        - name: {{ .Name }}-bootstrap
          mountPath: /etc/mysql/conf.d
      volumes:
        - name: {{ .Name }}-bootstrap
          configMap:
            name: {{ .Name }}-bootstrap
            items:
            - key: galera.cnf
              path: galera.cnf
```

As we can see, this one is a bit more complicated, so let’s break it down. Galera is an extension to MySQL, and in this case we are using MariaDB, and the standard upstream MariaDB image. We are setting labels and selectors that we use to link our resources together, and ensuring unique names by using the .Name variable from KUDO. 

```
        app: galera-bootstrap
        instance: {{ .Name }}
```

We are also configuring a number of ports for our container, matching our service, and using the values from our params.yaml :

```
  ports:
        - containerPort: {{ .Params.MYSQL_PORT }}
          name: mysql
        - containerPort: {{ .Params.SST_PORT }}
          name: sst
        - containerPort: {{ .Params.REPLICATION_PORT }}
          name: replication
        - containerPort: {{ .Params.IST_PORT }}
          name: ist
```

This image also allows the MySQL root password to be defined as an environment variable, so we are setting that to a value we will define in params.yaml :

```
        env:
          # Use secret in real usage
        - name: MYSQL_ROOT_PASSWORD
          value: {{ .Params.MYSQL_ROOT_PASSWORD }}
```


Our liveness and readiness probes will use this, so we are templating that in there as well :

```

        livenessProbe:
          exec:
            command: ["mysqladmin", "-p{{ .Params.MYSQL_ROOT_PASSWORD }}", "ping"]
          initialDelaySeconds: 30
          periodSeconds: 10
          timeoutSeconds: 5
        readinessProbe:
          exec:
            # Check we can execute queries over TCP (skip-networking is off).
            command: ["mysql", "-p{{ .Params.MYSQL_ROOT_PASSWORD }}", "-h", "127.0.0.1", "-e", "SELECT 1"]
          initialDelaySeconds: 5
          periodSeconds: 2
          timeoutSeconds: 1
```

We’ll also need to mount the volume containing our ConfigMap :

```
        volumeMounts:
        - name: {{ .Name }}-bootstrap
          mountPath: /etc/mysql/conf.d
      volumes:
        - name: {{ .Name }}-bootstrap
          configMap:
            name: {{ .Name }}-bootstrap
            items:
            - key: galera.cnf
              path: galera.cnf
```

Here we create the volume, using a unique name, and connect that to our ConfigMap, defining which key we should look for in the ConfigMap, and an output path. We then mount that into our container filesystem into /etc/mysql/conf.d where it will be automatically included into the configuration for MariaDB. 

Before we can actually deploy this, we need to add that MYSQL_ROOT_PASSWORD into our params.yaml :

```
MacBook-Pro:operator matt$ cat params.yaml 
apiVersion: kudo.dev/v1beta1
parameters:
  - name: SST_USER
    description: "User to perform SST as"
    default: "root"
  - name: SST_PASSWORD
    description: "Password for SST user"
    default: "admin"
  - name: MYSQL_PORT
    description: "MySQL port"
    default: "3306"
  - name: SST_PORT
    description: "SST port"
    default: "4444"
  - name: REPLICATION_PORT
    description: "Replication port"
    default: "4567"
  - name: IST_PORT
    description: "IST port"
    default: "4568"
  - name: MYSQL_ROOT_PASSWORD
    description: "MySQL root password"
    default: "admin"
```

Now when we install our operator, we’ll expect to see our bootstrap node actually deploy :

```
MacBook-Pro:operator matt$ kubectl kudo install .
operator.kudo.dev/v1beta1/galera created
operatorversion.kudo.dev/v1beta1/galera-0.1.0 created
instance.kudo.dev/v1beta1/galera-instance created
MacBook-Pro:operator matt$ kubectl kudo plan status --instance galera-instance
Plan(s) for "galera-instance" in namespace "default":
.
└── galera-instance (Operator-Version: "galera-0.1.0" Active-Plan: "deploy")
    └── Plan deploy (serial strategy) [IN_PROGRESS], last updated 2020-06-23 15:11:58
        └── Phase deploy (serial strategy) [IN_PROGRESS]
            ├── Step bootstrap_config [COMPLETE]
            ├── Step bootstrap_service [COMPLETE]
            └── Step bootstrap_deploy [IN_PROGRESS]

MacBook-Pro:operator matt$ kubectl get pods
NAME                                         READY   STATUS    RESTARTS   AGE
galera-instance-bootstrap-869c8bd847-7nk7b   1/1     Running   0          47s
```

So we can see our Galera bootstrap node is now up and running. Let’s check if it’s working correctly :

```
MacBook-Pro:operator matt$ kubectl logs galera-instance-bootstrap-869c8bd847-7nk7b

--- SNIPPED FOR BREVITY---
2020-06-23 14:12:40 2 [Note] WSREP: Bootstrapping a new cluster, setting initial position to 00000000-0000-0000-0000-000000000000:-1
2020-06-23 14:12:40 9 [Note] WSREP: Recovered cluster id 8e5db55f-b55b-11ea-8b9f-b7e6a2570731
2020-06-23 14:12:40 2 [Note] WSREP: Server status change initialized -> joined
2020-06-23 14:12:40 2 [Note] WSREP: wsrep_notify_cmd is not defined, skipping notification.
2020-06-23 14:12:40 2 [Note] WSREP: wsrep_notify_cmd is not defined, skipping notification.
2020-06-23 14:12:40 2 [Note] WSREP: Lowest cert indnex boundary for CC from group: 7172
2020-06-23 14:12:40 2 [Note] WSREP: Min available from gcache for CC from group: 7172
2020-06-23 14:12:40 2 [Note] WSREP: Server galera-instance-bootstrap-869c8bd847-7nk7b synced with group
2020-06-23 14:12:40 2 [Note] WSREP: Server status change joined -> synced
2020-06-23 14:12:40 2 [Note] WSREP: Synchronized with group, ready for connections
2020-06-23 14:12:40 2 [Note] WSREP: wsrep_notify_cmd is not defined, skipping notification.
2020-06-23 14:12:40 0 [Note] Reading of all Master_info entries succeeded
2020-06-23 14:12:40 0 [Note] Added new Master_info '' to hash table
2020-06-23 14:12:40 0 [Note] mysqld: ready for connections.
```

We can see from the logs that Galera has been configured, and has created a new cluster ready to be joined. 

We can also look into our running container, and check our ConfigMap is mounted correctly :

```
MacBook-Pro:operator matt$ kubectl exec -it galera-instance-bootstrap-869c8bd847-7nk7b /bin/bash
root@galera-instance-bootstrap-869c8bd847-7nk7b:/# ls /etc/mysql/conf.d/
galera.cnf
root@galera-instance-bootstrap-869c8bd847-7nk7b:/# cat /etc/mysql/conf.d/galera.cnf 
[galera]
wsrep_on = ON
wsrep_provider = /usr/lib/galera/libgalera_smm.so
wsrep_sst_method = mariabackup
wsrep_cluster_address = gcomm://
wsrep_sst_auth = "root:admin"
binlog_format = ROW
```

Now when we look at our service, we can see we have an endpoint correctly registered :

```
MacBook-Pro:operator matt$ kubectl describe service galera-instance-bootstrap-svc
Name:              galera-instance-bootstrap-svc
Namespace:         default
Labels:            app=galera-bootstrap
                   heritage=kudo
                   kudo.dev/instance=galera-instance
                   kudo.dev/operator=galera
Annotations:       kudo.dev/last-applied-configuration:
                     {"kind":"Service","apiVersion":"v1","metadata":{"name":"galera-instance-bootstrap-svc","namespace":"default","creationTimestamp":null,"lab...
                   kudo.dev/last-plan-execution-uid: 195f475b-2ac3-408f-b9d9-9d213387ccde
                   kudo.dev/operator-version: 0.1.0
                   kudo.dev/phase: deploy
                   kudo.dev/plan: deploy
                   kudo.dev/step: bootstrap_service
Selector:          app=galera-bootstrap,instance=galera-instance
Type:              ClusterIP
IP:                None
Port:              mysql  3306/TCP
TargetPort:        3306/TCP
Endpoints:         10.244.3.4:3306
Port:              sst  4444/TCP
TargetPort:        4444/TCP
Endpoints:         10.244.3.4:4444
Port:              replication  4567/TCP
TargetPort:        4567/TCP
Endpoints:         10.244.3.4:4567
Port:              ist  4568/TCP
TargetPort:        4568/TCP
Endpoints:         10.244.3.4:4568
Session Affinity:  None
Events:            <none>
```

So we now have a fully functional Galera bootstrap node, configured and ready to receive connections. In this blog post, we've seen how to start building up your plans, testing each step before moving on to the next one, and adding parameters as you need them. In part 2 of this blog post, we’ll build out more of our KUDO operator to create additional nodes and join them to the cluster. 

<Authors about="mattj-io" />
