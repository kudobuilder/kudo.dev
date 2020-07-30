---
date: 2020-07-13
---

# Building your first KUDO operator - Part 2

In [part 1](blog-2020-06-building-your-first-operator-1.md) of this blog series, we started to build a KUDO operator for Galera, and I showed how we built up plans, steps and tasks to create the Galera bootstrap node. In this second part, we’ll extend the operator to deploy more nodes into our Galera cluster.

<!-- more -->

The next thing we need our operator to do is deploy the configuration required for the additional nodes to join the cluster initially. Let’s add some steps and tasks to our `operator.yaml` to do that :

```yaml
# operator.yaml
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
          - name: firstboot_config
            tasks:
              - firstboot_config
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
    - name: firstboot_config
      kind: Apply
      spec:
        resources:
          - galera_config.yaml
```

It's worth noting at this stage that whilst I have defined each of these steps separately, which will get executed serially by KUDO, some of them are not dependent on each other and could theoretically be combined into a single step which executes multiple tasks. Alternatively we could add another phase with a parallel execution strategy. For the purposes of this blog post, I have deliberately split them out and sequenced everything serially in in the interests of readability and comprehension.  
 
Now our `operator.yaml` is updated, we need to create the yaml file which our firstboot_config task is going to apply. 

```yaml
# galera_config.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: {{ .Name }}-nodeconfig
  namespace: {{ .Namespace }}
data:
  galera.cnf: |
    [galera]
    wsrep_on = ON
    wsrep_provider = /usr/lib/galera/libgalera_smm.so
    wsrep_sst_method = mariabackup
    wsrep_cluster_address = gcomm://{{ .Name }}-bootstrap-svc,{{ $.Name }}-{{ $.OperatorName }}-0.{{ $.Name }}-hs{{ range $i, $v := untilStep 1 (int .Params.NODE_COUNT) 1 }},{{ $.Name }}-{{ $.OperatorName }}-{{ $v }}.{{ $.Name }}-hs{{end}}
    wsrep_sst_auth = "{{ .Params.SST_USER }}:{{ .Params.SST_PASSWORD }}"
    binlog_format = ROW
  innodb.cnf: |
    [innodb]
    innodb_autoinc_lock_mode = 2
    innodb_flush_log_at_trx_commit = 0
    innodb_buffer_pool_size = 122M
```

Again this is going to add a ConfigMap to our cluster, with two data sections this time - some Galera specific configuration, and some configuration which is recommended for the InnoDB engine when using Galera.

As you can see the templating here is more complex than in our bootstrap configuration, so let’s break it down a bit. 

In our `wsrep_cluster_address` setting, we need the address of the service to connect to our bootstrap node, and then we need the addresses of each of the other nodes that will be in our cluster. That could be any arbitrary number that we will configure in our operator, so we need some code to iterate through a defined number of nodes and build that connection string. This list also needs to be comma separated. 

Here the [Sprig]( http://masterminds.github.io/sprig/ ) templating in KUDO really comes into it’s own:

```
wsrep_cluster_address = gcomm://{{ .Name }}-bootstrap-svc,{{ $.Name }}-{{ $.OperatorName }}-0.{{ $.Name }}-hs{{ range $i, $v := untilStep 1 (int .Params.NODE_COUNT) 1 }},{{ $.Name }}-{{ $.OperatorName }}-{{ $v }}.{{ $.Name }}-hs{{end}}
```

Before we break this code down, let's clarify a couple of assumptions that we can make:

1. Our nodes will be in a StatefulSet, so we can predict the naming of the pods will be `.Name-.OperatorName-number`, where `.Name` and `.OperatorName` are variables created by KUDO and number will be assigned by Kubernetes based on the order the replicas in the StatefulSet were instantiated.
2. We will be creating a headless service to access them, which we will name as `.Name-hs` to ensure uniqueness, and we will document that later in this blog. That will give us predictable DNS entries for each node in our StatefulSet in the format `.Name-.OperatorName-number.Name-hs`

Working from those assumptions we can start to put together the connection string. 

Firstly we add the service address for our bootstrap node, which we created in the last blog, followed by a comma:

```
gcomm://{{ .Name }}-bootstrap-svc,
```

We also know there will always be a node ending in 0, since we must have at least 1 node, so we can add the DNS entry for that node's service:

```
gcomm://{{ .Name }}-bootstrap-svc,{{ $.Name }}-{{ $.OperatorName }}-0.{{ $.Name }}-hs
```

For the next part, we need to define a value for the number of nodes we are going to deploy, in our `params.yaml` so we can refer to that here :

```yaml
# params.yaml
  - name: NODE_COUNT
    description: "Number of nodes to create in the cluster"
    default: "3"
```

Now we can use that variable in the next step of the Sprig templating :

```
{{ range $i, $v := untilStep 1 (int .Params.NODE_COUNT) 1 }},{{ $.Name }}-{{ $.OperatorName }}-{{ $v }}.{{ $.Name }}-hs{{end}}
```

Here we are using the range function, part of standard Go templating, which gives us values and indexes in `$v` and `$i`, to which we are passing a range generated using the UntilStep function from Sprig. UntilStep called in this way will give us a list of integers, starting at 1, up to `NODE_COUNT`, in steps of 1. So if `NODE_COUNT` is 3, then the range generated by UntilStep here would be 1,2. 

Note that we have to cast `.Params.NODE_COUNT` to an integer before we use it, since it’s just a string in our `params.yaml` file. We also need to precede the other string variables we are accessing inside our function with `$`, to refer to the top-level context again, since when the range function is invoked, variables are re-scoped to within the function.

Then this code will print out each entry for the nodes in our cluster, preceded by a comma. Finally we close the templating code with ` {{end}} `

Working out complex templating functions can be tricky, you might find it useful to have some stub Go code you can run when testing the templating. I have some [example code](https://github.com/mattj-io/template_test) in Github, which just prints out the template to stdout. 

::: tip
You can always run `kubectl kudo package verify .` to ensure that your templating is syntactically correct. This won't show you any logical mistakes, but it will catch a couple of problems.
:::

We can also check our new parameters and tasks are correctly defined using the CLI extension, which at least gives us some indication that our YAML is correct:

```
operator $ kubectl kudo package list plans .
plans
└── deploy (serial)
    └── [phase]  deploy (serial)
        ├── [step]  bootstrap_config
        │   └── bootstrap_config
        ├── [step]  bootstrap_service
        │   └── bootstrap_service
        ├── [step]  bootstrap_deploy
        │   └── bootstrap_deploy
        └── [step]  firstboot_config
            └── firstboot_config
```

We can see here that our new step is defined. Let's check if the task is also correct:

```
operator $ kubectl kudo package list tasks .
Name             	Kind 	Resources               
bootstrap_config 	Apply	[bootstrap_config.yaml] 
bootstrap_service	Apply	[bootstrap_service.yaml]
bootstrap_deploy 	Apply	[bootstrap_deploy.yaml] 
firstboot_config 	Apply	[galera_config.yaml] 
```

And finally let's check the parameter:

```
operator $ kubectl kudo package list parameters .
Name               	Default	Required
IST_PORT           	4568   	true    
MYSQL_PORT         	3306   	true    
MYSQL_ROOT_PASSWORD	admin  	true    
NODE_COUNT         	3      	true    
REPLICATION_PORT   	4567   	true    
SST_PASSWORD       	admin  	true    
SST_PORT           	4444   	true    
SST_USER           	root   	true  
```

Now we've checked those appear to be correct, let’s go ahead and deploy our operator again to test things out. 

```
operator $ kubectl kudo install .
operator.kudo.dev/v1beta1/galera created
operatorversion.kudo.dev/v1beta1/galera-0.1.0 created
instance.kudo.dev/v1beta1/galera-instance created
MacBook-Pro:operator matt$ kubectl kudo plan status --instance galera-instance
Plan(s) for "galera-instance" in namespace "default":
.
└── galera-instance (Operator-Version: "galera-0.1.0" Active-Plan: "deploy")
    └── Plan deploy (serial strategy) [COMPLETE], last updated 2020-06-24 14:32:26
        └── Phase deploy (serial strategy) [COMPLETE]
            ├── Step bootstrap_config [COMPLETE]
            ├── Step bootstrap_service [COMPLETE]
            ├── Step bootstrap_deploy [COMPLETE]
            └── Step firstboot_config [COMPLETE]
```

So we can see our operator completed all the steps we had from the previous blog, as well as completing our new step `firstboot_config`. We expect this to have created a ConfigMap, so we can check it’s correctly been templated out. 

```
operator $ kubectl get configmaps
NAME                         DATA   AGE
galera-instance-bootstrap    1      6m17s
galera-instance-nodeconfig   2      5m32s
MacBook-Pro:operator matt$ kubectl describe configmap galera-instance-nodeconfig
Name:         galera-instance-nodeconfig
Namespace:    default
Labels:       heritage=kudo
              kudo.dev/instance=galera-instance
              kudo.dev/operator=galera
Annotations:  kudo.dev/last-applied-configuration:
                {"kind":"ConfigMap","apiVersion":"v1","metadata":{"name":"galera-instance-nodeconfig","namespace":"default","creationTimestamp":null,"labe...
              kudo.dev/last-plan-execution-uid: 35f18f81-bb38-4881-a132-e4741cb913a2
              kudo.dev/operator-version: 0.1.0
              kudo.dev/phase: deploy
              kudo.dev/plan: deploy
              kudo.dev/step: firstboot_config

Data
====
galera.cnf:
----
[galera]
wsrep_on = ON
wsrep_provider = /usr/lib/galera/libgalera_smm.so
wsrep_sst_method = mariabackup
wsrep_cluster_address = gcomm://galera-instance-bootstrap-svc,galera-instance-galera-0.galera-instance-hs,galera-instance-galera-1.galera-instance-hs,galera-instance-galera-2.galera-instance-hs
wsrep_sst_auth = "root:admin"
binlog_format = ROW

innodb.cnf:
----
[innodb]
innodb_autoinc_lock_mode = 2
innodb_flush_log_at_trx_commit = 0
innodb_buffer_pool_size = 122M

Events:  <none>
```

So we can see our ConfigMap is deployed to the cluster, and the templating has created the correct entry for `wsrep_cluster_address` when `NODE_COUNT` is defined as 3. Clean up the test cluster once again, and let’s move on. 

We are going to deploy our remaining nodes in a StatefulSet, and we’ll need a way to connect to them, so let’s add a Service. Once again we define the steps, tasks and resources in our `operator.yaml` :

```yaml
# operator.yaml
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
          - name: firstboot_config
            tasks:
              - firstboot_config
          - name: cluster_services
            tasks:
              - cluster_services
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
    - name: firstboot_config
      kind: Apply
      spec:
        resources:
          - galera_config.yaml
    - name: cluster_services
      kind: Apply
      spec:
        resources:
          - hs-service.yaml
```

Now let’s create the `hs-service.yaml` which this step needs :

```yaml
# hs-service.yaml
apiVersion: v1
kind: Service
metadata:
  name: {{ .Name }}-hs
  namespace: {{ .Namespace }}
  labels:
    app: galera
    galera: {{ .Name }} 
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
  clusterIP: None
  selector:
    app: galera
    instance: {{ .Name }}
```

So here we are creating a headless service ( with no ClusterIP ) for all the ports Galera needs, with values pulled in from our `params.yaml`, and we are selecting on two labels, app and instance, to ensure uniqueness for each deployment. The reason for the headless service is that we don’t need a load balanced address for this service, we only need DNS entries for each node in our StatefulSet.

Now we can deploy again, and check the service has been correctly created. 

```
operator $ kubectl kudo plan status --instance galera-instance
Plan(s) for "galera-instance" in namespace "default":
.
└── galera-instance (Operator-Version: "galera-0.1.0" Active-Plan: "deploy")
    └── Plan deploy (serial strategy) [COMPLETE], last updated 2020-06-24 14:50:51
        └── Phase deploy (serial strategy) [COMPLETE]
            ├── Step bootstrap_config [COMPLETE]
            ├── Step bootstrap_service [COMPLETE]
            ├── Step bootstrap_deploy [COMPLETE]
            ├── Step firstboot_config [COMPLETE]
            └── Step cluster_services [COMPLETE]

operator $ kubectl get services
NAME                            TYPE        CLUSTER-IP   EXTERNAL-IP   PORT(S)                               AGE
galera-instance-bootstrap-svc   ClusterIP   None         <none>        3306/TCP,4444/TCP,4567/TCP,4568/TCP   2m51s
galera-instance-hs              ClusterIP   None         <none>        3306/TCP,4444/TCP,4567/TCP,4568/TCP   2m28s
operator $ kubectl describe service galera-instance-hs
Name:              galera-instance-hs
Namespace:         default
Labels:            app=galera
                   galera=galera-instance
                   heritage=kudo
                   kudo.dev/instance=galera-instance
                   kudo.dev/operator=galera
Annotations:       kudo.dev/last-applied-configuration:
                     {"kind":"Service","apiVersion":"v1","metadata":{"name":"galera-instance-hs","namespace":"default","creationTimestamp":null,"labels":{"app"...
                   kudo.dev/last-plan-execution-uid: 0374f5bc-27e9-4b28-ada9-371a149cf05b
                   kudo.dev/operator-version: 0.1.0
                   kudo.dev/phase: deploy
                   kudo.dev/plan: deploy
                   kudo.dev/step: cluster_services
Selector:          app=galera,instance=galera-instance
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

We can see here that the additional service has been created correctly, is using the correct selectors, and it currently has no endpoints since we haven’t deployed any nodes yet. 

Once again, let’s clean up the cluster and move on to our next step. 

Now we have our configuration and service defined, we can finally add our StatefulSet. Once again, add the steps, tasks and resources to our `operator.yaml`: 

```yaml
# operator.yaml
steps:
    - name: statefulset
      tasks:
        - statefulset

tasks:
    - name: statefulset
      kind: Apply
      spec:
        resources:
          - statefulset.yaml
```

And let’s create the `statefulset.yaml` :

```yaml
# statefulset.yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: {{ .Name }}-{{ .OperatorName }}
  namespace: {{ .Namespace }}
  labels:
    galera: {{ .OperatorName }}
    app: galera
    instance: {{ .Name }}
  annotations:
    reloader.kudo.dev/auto: "true"
spec:
  selector:
    matchLabels:
      app: galera
      galera: {{ .OperatorName }}
      instance: {{ .Name }}
  serviceName: {{ .Name }}-hs
  replicas: {{ .Params.NODE_COUNT }}
  updateStrategy:
    type: RollingUpdate
  template:
    metadata:
      labels:
        app: galera
        galera: {{ .OperatorName }}
        instance: {{ .Name }}
    spec:
      initContainers:
      # Stop the image bootstrap script from trying to set up single master
      - name: {{ .Name }}-init
        image: busybox:1.28
        command: ['sh', '-c', 'set -x; if [ ! -d /datadir/mysql ]; then mkdir /datadir/mysql; fi']
        volumeMounts:
          - name: {{ .Name }}-datadir
            mountPath: "/datadir"
      containers:
      - name: mariadb
        image: mariadb:latest
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
        - name: {{ .Name }}-config
          mountPath: /etc/mysql/conf.d
        - name: {{ .Name }}-datadir
          mountPath: /var/lib/mysql
      volumes:
      - name: {{ .Name }}-config
        configMap:
          name: {{ .Name }}-nodeconfig
          items:
            - key: galera.cnf
              path: galera.cnf
            - key: innodb.cnf
              path: innodb.cnf
  volumeClaimTemplates:
    - metadata:
        name: {{ .Name }}-datadir
      spec:
        accessModes: [ "ReadWriteOnce" ]
        resources:
          requests:
            storage: {{ .Params.VOLUME_SIZE }}

```

There’s a few things to note in this yaml file. Firstly, our StatefulSet is going to use persistent volumes for the MySQL data directory `/var/lib/mysql`, and we’re also going to mount the ConfigMaps we created earlier into `/etc/mysql/conf.d` where they will get picked up on startup:

```yaml
# statefulset.yaml
        volumeMounts:
        - name: {{ .Name }}-config
          mountPath: /etc/mysql/conf.d
        - name: {{ .Name }}-datadir
          mountPath: /var/lib/mysql
      volumes:
      - name: {{ .Name }}-config
        configMap:
          name: {{ .Name }}-nodeconfig
          items:
            - key: galera.cnf
              path: galera.cnf
            - key: innodb.cnf
              path: innodb.cnf
```

Since this is a StatefulSet, we also define a VolumeClaimTemplate which will add the VolumeClaims we need for each replica :

```yaml
# statefulset.yaml
  volumeClaimTemplates:
    - metadata:
        name: {{ .Name }}-datadir
      spec:
        accessModes: [ "ReadWriteOnce" ]
        resources:
          requests:
            storage: {{ .Params.VOLUME_SIZE }}
```

This is going to use a configurable `VOLUME_SIZE` parameter that we need to add to our `params.yaml`

```yaml
# params.yaml
  - name: VOLUME_SIZE
    description: "Size of persistent volume"
    default: "10M"
```

I’ve added a very small default size here just for testing.

The MariaDB container image has bootstrap scripts which try to set up a single node instance when the container is first started. For our use case we need to override that script, which works by checking for a mysql folder in `/var/lib/mysql`, indicating a database is already present and to skip that portion of the bootstrapping. We’ll override that by using an init container, mounting the data directory and creating the folder before those scripts run, which will allow the Galera process to run correctly and synchronise to the cluster as per the configuration we created in the ConfigMap. 

```yaml
# statefulset.yaml
initContainers:
      # Stop the image bootstrap script from trying to set up single master
      - name: {{ .Name }}-init
        image: busybox:1.28
        command: ['sh', '-c', 'set -x; if [ ! -d /datadir/mysql ]; then mkdir /datadir/mysql; fi']
        volumeMounts:
          - name: {{ .Name }}-datadir
            mountPath: "/datadir"
```

We are using our `NODE_COUNT` parameter to set how many replicas should be in this StatefulSet:

```yaml
# statefulset.yaml
  replicas: {{ .Params.NODE_COUNT }}
```

And we are also defining the ports using the parameters we set for those in the [first part](blog-2020-06-building-your-first-operator-1.md) of this blog:

```yaml
# statefulset.yaml
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

Let’s go ahead and test this part of our operator - for testing purposes you may want to set `NODE_COUNT` to 1 in your `params.yaml`.

```
operator $ kubectl kudo plan status --instance galera-instance
Plan(s) for "galera-instance" in namespace "default":
.
└── galera-instance (Operator-Version: "galera-0.1.0" Active-Plan: "deploy")
    └── Plan deploy (serial strategy) [COMPLETE], last updated 2020-06-24 15:28:32
        └── Phase deploy (serial strategy) [COMPLETE]
            ├── Step bootstrap_config [COMPLETE]
            ├── Step bootstrap_service [COMPLETE]
            ├── Step bootstrap_deploy [COMPLETE]
            ├── Step firstboot_config [COMPLETE]
            ├── Step cluster_services [COMPLETE]
            └── Step statefulset [COMPLETE]

operator $ kubectl get pods
NAME                                         READY   STATUS    RESTARTS   AGE
galera-instance-bootstrap-7566f8b69b-7fxxm   1/1     Running   0          2m50s
galera-instance-galera-0                     1/1     Running   0          2m7s
galera-instance-galera-1                     1/1     Running   0          82s
galera-instance-galera-2                     1/1     Running   0          56s
```

All of our instances for our running cluster are now created. Let's check the logs and see if Galera looks like it is working :

```
operator $ kubectl logs galera-instance-galera-0
----SNIPPED---
2020-06-24 14:28:15 1 [Note] WSREP: ================================================
View:
  id: b60a66f0-b626-11ea-a19c-0a391f30f86f:7175
  status: primary
  protocol_version: 4
  capabilities: MULTI-MASTER, CERTIFICATION, PARALLEL_APPLYING, REPLAY, ISOLATION, PAUSE, CAUSAL_READ, INCREMENTAL_WS, UNORDERED, PREORDERED, STREAMING, NBO
  final: no
  own_index: 1
  members(4):
	0: c01a8198-b626-11ea-aaa1-1632aa349ff0, galera-instance-bootstrap-7566f
	1: d20464f9-b626-11ea-bd04-7aaebcdf5dd7, galera-instance-galera-0
	2: e1dda89a-b626-11ea-82ed-f72190284b55, galera-instance-galera-1
	3: f07db060-b626-11ea-8916-7e6c9ef1b8d5, galera-instance-galera-2
=================================================
2020-06-24 14:28:15 1 [Note] WSREP: wsrep_notify_cmd is not defined, skipping notification.
2020-06-24 14:28:15 1 [Note] WSREP: Lowest cert indnex boundary for CC from group: 7175
2020-06-24 14:28:15 1 [Note] WSREP: Min available from gcache for CC from group: 7173
2020-06-24 14:28:16 0 [Note] WSREP: Member 3.0 (galera-instance-galera-2) requested state transfer from '*any*'. Selected 0.0 (galera-instance-bootstrap-7566f8b69b-7fxxm)(SYNCED) as donor.
2020-06-24 14:28:18 0 [Note] WSREP: (d20464f9-bd04, 'tcp://0.0.0.0:4567') turning message relay requesting off
2020-06-24 14:28:29 0 [Note] WSREP: 0.0 (galera-instance-bootstrap-7566f8b69b-7fxxm): State transfer to 3.0 (galera-instance-galera-2) complete.
2020-06-24 14:28:29 0 [Note] WSREP: Member 0.0 (galera-instance-bootstrap-7566f8b69b-7fxxm) synced with group.
2020-06-24 14:28:30 0 [Note] WSREP: 3.0 (galera-instance-galera-2): State transfer from 0.0 (galera-instance-bootstrap-7566f8b69b-7fxxm) complete.
2020-06-24 14:28:30 0 [Note] WSREP: Member 3.0 (galera-instance-galera-2) synced with group.
```

So at this point we can see our StatefulSet has come up correctly, and all of our nodes have joined the Galera cluster ! Everything should be working correctly now internally in the cluster, but our operator is still not complete - our bootstrap node is no longer required, we need to enable external connectivity to the cluster, and add functionality to make sure we can safely scale up and down whilst still maintaining full operation. In the third part of this blog series, we’ll extend our operator to address all of those issues. 

<Authors about="mattj-io" />
