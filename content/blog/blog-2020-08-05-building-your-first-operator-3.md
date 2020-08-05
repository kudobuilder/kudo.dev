---
date: 2020-08-05
---

# Building your first KUDO operator - Part 3

In [part 1](blog-2020-06-building-your-first-operator-1.md) and [2](blog-2020-07-13-building-your-first-operator-2.md) of this blog series, I showed how we bootstrapped a Galera cluster using KUDO, by building up our operator in a series of steps, testing each one as we went.

In this third part, we’ll finish our production-ready deployment phase, adding connectivity and ensuring our cluster can scale up and down without interrupting service.

<!-- more -->

In part 2, we brought up the remaining nodes of our cluster, but we still have the bootstrap node running, which is no longer required. Let’s extend our operator to get rid of that. 

Firstly we’ll want to delete the resources associated with the bootstrap node. In our `operator.yaml`, let’s create a step to do that :

```yaml
          - name: cleanup
            tasks:
              - bootstrap_cleanup

  - name: bootstrap_cleanup
      kind: Delete
      spec:
        resources:
          - bootstrap_deploy.yaml
          - bootstrap_service.yaml
          - bootstrap_config.yaml
```

As we can see, this time we’ve added a [Delete task](../docs/developing-operators/tasks.md#delete-task), and this task’s resources are all of the yaml files we developed in [Part 1](blog-2020-06-building-your-first-operator-1.md). Once this task runs, it will delete all of the bootstrap resources defined in those yaml files from our cluster - the configmap, the service, and the deployment itself. 

However, we still have the bootstrap node configured in the configmap we are using on our actual Galera nodes. This isn’t necessarily an issue for a running Galera instance, since it will work around missing nodes, but in the interests of completeness let’s see how we can remove that. Firstly, to the cleanup step we just defined, let’s add another task :

```yaml
       - name: cleanup
            tasks:
              - bootstrap_cleanup
              - config

    - name: config
      kind: Apply
      spec:
        resources:
          - galera_config.yaml
```

We’ve added two tasks to a single step here. These will be executed serially, since in our deploy phase we have configured the execution strategy as serial.

```yaml
    phases:
      - name: deploy
        strategy: serial
```

Notice that also we’re referring to the pre-existing `galera_config.yaml` that we used in Part 2 to configure our nodes. In our templates, we also have access to a few other system [variables](../docs/developing-operators/templates.md#variables), one of which is `.StepName`

We can use that variable to insert conditionals into our templates depending on which step they were called in, so let’s modify that file :

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
    {{ if eq .StepName "firstboot_config" -}}
    wsrep_cluster_address = gcomm://{{ .Name }}-bootstrap-svc,{{ $.Name }}-{{ $.OperatorName }}-0.{{ $.Name }}-hs{{ range $i, $v := untilStep 1 (int .Params.NODE_COUNT) 1 }},{{ $.Name }}-{{ $.OperatorName }}-{{ $v }}.{{ $.Name }}-hs{{end}}
    {{ else -}}
    wsrep_cluster_address = gcomm://{{ $.Name }}-galera-0.{{ $.Name }}-hs{{ range $i, $v := untilStep 1 (int .Params.NODE_COUNT) 1 }},{{ $.Name }}-galera-{{ $v }}.{{ $.Name }}-hs{{end}}
    {{ end -}}
    wsrep_sst_auth = "root:{{ .Params.MYSQL_ROOT_PASSWORD }}"
    binlog_format = ROW
  innodb.cnf: |
    [innodb]
    innodb_autoinc_lock_mode = 2
    innodb_flush_log_at_trx_commit = 0
    innodb_buffer_pool_size = 122M
```

You can see we’ve added the conditional step around the `wsrep_cluster_address`, which means it gets the bootstrap configuration if called in the `firstboot_config` step, otherwise it just has the nodes in the cluster. 

```yaml
{{ if eq .StepName "firstboot_config" -}}
    wsrep_cluster_address = gcomm://{{ .Name }}-bootstrap-svc,{{ $.Name }}-{{ $.OperatorName }}-0.{{ $.Name }}-hs{{ range $i, $v := untilStep 1 (int .Params.NODE_COUNT) 1 }},{{ $.Name }}-{{ $.OperatorName }}-{{ $v }}.{{ $.Name }}-hs{{end}}
    {{ else -}}
    wsrep_cluster_address = gcomm://{{ $.Name }}-galera-0.{{ $.Name }}-hs{{ range $i, $v := untilStep 1 (int .Params.NODE_COUNT) 1 }},{{ $.Name }}-galera-{{ $v }}.{{ $.Name }}-hs{{end}}
    {{ end -}}
```

Note that we terminate both the `if`, `else` and `end` statements with a hyphen. This tells the templating engine not to leave an empty line where those statements were in the template. For a full explanation of the templating code, have a look at [Part 2](blog-2020-07-13-building-your-first-operator-2.md) of this blog.

By using these kinds of conditionals inside our templates, we can re-use code across different tasks, meaning we have less code to write and maintain.

Now if any of our pods restart, they will start back up again with the correct configuration for the post-bootstrap cluster. 

Let’s go ahead and test this piece of our operator :

```
operator $ kubectl kudo install .
operator.kudo.dev/v1beta1/galera created
operatorversion.kudo.dev/v1beta1/galera-0.1.0 created
instance.kudo.dev/v1beta1/galera-instance created

operator $ kubectl kudo plan status --instance galera-instance
Plan(s) for "galera-instance" in namespace "default":
.
└── galera-instance (Operator-Version: "galera-0.1.0" Active-Plan: "deploy")
    └── Plan deploy (serial strategy) [COMPLETE], last updated 2020-07-03 15:09:40
        └── Phase deploy (serial strategy) [COMPLETE]
            ├── Step bootstrap_config [COMPLETE]
            ├── Step bootstrap_service [COMPLETE]
            ├── Step bootstrap_deploy [COMPLETE]
            ├── Step firstboot_config [COMPLETE]
            ├── Step cluster_services [COMPLETE]
            ├── Step statefulset [COMPLETE]
            └── Step cleanup [COMPLETE]

operator $ kubectl describe configmap galera-instance-nodeconfig
Name:         galera-instance-nodeconfig
Namespace:    default
Labels:       heritage=kudo
              kudo.dev/instance=galera-instance
              kudo.dev/operator=galera
Annotations:  kudo.dev/last-applied-configuration:
                {"kind":"ConfigMap","apiVersion":"v1","metadata":{"name":"galera-instance-nodeconfig","namespace":"default","creationTimestamp":null,"labe...
              kudo.dev/last-plan-execution-uid: b59912c2-9a52-4130-95cd-bd76d215c10e
              kudo.dev/operator-version: 0.1.0
              kudo.dev/phase: deploy
              kudo.dev/plan: deploy
              kudo.dev/step: cleanup

Data
====
galera.cnf:
----
[galera]
wsrep_on = ON
wsrep_provider = /usr/lib/galera/libgalera_smm.so
wsrep_sst_method = mariabackup
wsrep_cluster_address = gcomm://galera-instance-galera-0.galera-instance-hs,galera-instance-galera-1.galera-instance-hs,galera-instance-galera-2.galera-instance-hs
wsrep_sst_auth = "root:admin"
binlog_format = ROW

innodb.cnf:
----
[innodb]
innodb_autoinc_lock_mode = 2
innodb_flush_log_at_trx_commit = 0
innodb_buffer_pool_size = 122M

Events:  <none>

operator $ kubectl get pods
NAME                       READY   STATUS    RESTARTS   AGE
galera-instance-galera-0   1/1     Running   0          3m20s
galera-instance-galera-1   1/1     Running   0          3m
galera-instance-galera-2   1/1     Running   0          2m40s
```

So now when our operator deploys, we end up with a working cluster minus our bootstrap node, and all with the correct working configuration !

We next need a way for clients to connect to our Galera cluster. Since the cluster is multi-master, we can read or write from any of them safely, so let’s define a Service for that. Services have no dependencies on anything else, so we can create this at any stage in our deploy plan. We already had a step defined to create our internal cluster services, so let’s use that and add to it :

```yaml
    - name: cluster_services
      kind: Apply
      spec:
        resources:
          - hs-service.yaml
          - cs-service.yaml

```

So the cluster_services step will now add both the original hs-service.yaml and a new file cs-service.yaml :

```yaml
apiVersion: v1
kind: Service
metadata:
  name: {{ .Name }}-cs
  namespace: {{ .Namespace }}
  labels:
    app: galera
    galera: {{ .Name }} 
spec:
  ports:
    - port: {{ .Params.MYSQL_PORT }}
      name: mysql
  selector:
    app: galera
    instance: {{ .Name }}
```

For this service, we only need the MySQL port, and by default this will give us a load balanced ClusterIP, which our clients can use to connect to our cluster.

Let’s go ahead and test this part :

```
operator $ kubectl kudo plan status --instance galera-instance
Plan(s) for "galera-instance" in namespace "default":
.
└── galera-instance (Operator-Version: "galera-0.1.0" Active-Plan: "deploy")
    └── Plan deploy (serial strategy) [COMPLETE], last updated 2020-07-03 15:28:28
        └── Phase deploy (serial strategy) [COMPLETE]
            ├── Step bootstrap_config [COMPLETE]
            ├── Step bootstrap_service [COMPLETE]
            ├── Step bootstrap_deploy [COMPLETE]
            ├── Step firstboot_config [COMPLETE]
            ├── Step cluster_services [COMPLETE]
            ├── Step statefulset [COMPLETE]
            └── Step cleanup [COMPLETE]

operator $ kubectl get services
NAME                 TYPE        CLUSTER-IP    EXTERNAL-IP   PORT(S)                               AGE
galera-instance-cs   ClusterIP   10.99.32.75   <none>        3306/TCP                              17m
galera-instance-hs   ClusterIP   None          <none>        3306/TCP,4444/TCP,4567/TCP,4568/TCP   17m
kubernetes           ClusterIP   10.96.0.1     <none>        443/TCP                               54m

operator $ kubectl describe service galera-instance-cs
Name:              galera-instance-cs
Namespace:         default
Labels:            app=galera
                   galera=galera-instance
                   heritage=kudo
                   kudo.dev/instance=galera-instance
                   kudo.dev/operator=galera
Annotations:       kudo.dev/last-applied-configuration:
                     {"kind":"Service","apiVersion":"v1","metadata":{"name":"galera-instance-cs","namespace":"default","creationTimestamp":null,"labels":{"app"...
                   kudo.dev/last-plan-execution-uid: a4fdb1f6-b00d-48f7-9364-e39e2e892aaa
                   kudo.dev/operator-version: 0.1.0
                   kudo.dev/phase: deploy
                   kudo.dev/plan: deploy
                   kudo.dev/step: cluster_services
Selector:          app=galera,instance=galera-instance
Type:              ClusterIP
IP:                10.99.32.75
Port:              mysql  3306/TCP
TargetPort:        3306/TCP
Endpoints:         10.244.1.6:3306,10.244.2.8:3306,10.244.3.7:3306
Session Affinity:  None
Events:            <none>

operator $ kubectl run mysql-client --image=mysql:5.7 -it --rm --restart=Never -- mysql -u root -h galera-instance-cs -p
If you don't see a command prompt, try pressing enter.

Welcome to the MySQL monitor.  Commands end with ; or \g.
Your MySQL connection id is 583
Server version: 5.5.5-10.5.4-MariaDB-1:10.5.4+maria~focal mariadb.org binary distribution

Copyright (c) 2000, 2020, Oracle and/or its affiliates. All rights reserved.

Oracle is a registered trademark of Oracle Corporation and/or its
affiliates. Other names may be trademarks of their respective
owners.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

mysql> 
```

You’ll need to enter the password defined in `params.yaml` when you see the line:

```
If you don't see a command prompt, try pressing enter.
```

So at this point we can definitely connect to our cluster using the Service address we have just defined. 

The next thing we need to configure is the behaviour of our cluster when we change the NODE_COUNT value, ie. when we scale up or down. By default in KUDO, a change to a parameter will trigger the deploy plan to run again, which is not what we want. What needs to happen in our cluster is that the ConfigMap needs to change, to reflect the new number of nodes, and then our StatefulSet will need to restart to pick up the new number of nodes in the cluster. To do all of this we’re going to create a new plan in our `operator.yaml`

```yaml
  node_update:
    strategy: serial
    phases:
      - name: deploy
        strategy: serial
        steps:
          - name: config
            tasks:
              - config
          - name: statefulset
            tasks:
              - statefulset
```

We don’t need any new tasks for this change, we’re just defining two steps which will run in this new plan when it is triggered. We then need to tell KUDO to run this plan when our NODE_COUNT variable is changed by changing the configuration in `params.yaml` : 

```yaml
  - name: NODE_COUNT
    description: "Number of nodes to create in the cluster"
    default: "3"
    trigger: node_update
```

Let’s reinstall our operator, and see what happens when we change this parameter once the operator is running 

```
operator $ kubectl kudo install .
operator.kudo.dev/v1beta1/galera created
operatorversion.kudo.dev/v1beta1/galera-0.1.0 created
instance.kudo.dev/v1beta1/galera-instance created

operator $ kubectl kudo update --instance galera-instance -p NODE_COUNT=3
Instance galera-instance was updated.

operator $ kubectl kudo plan status --instance galera-instance
Plan(s) for "galera-instance" in namespace "default":
.
└── galera-instance (Operator-Version: "galera-0.1.0" Active-Plan: "node_update")
    ├── Plan deploy (serial strategy) [NOT ACTIVE]
    │   └── Phase deploy (serial strategy) [NOT ACTIVE]
    │       ├── Step bootstrap_config [NOT ACTIVE]
    │       ├── Step bootstrap_service [NOT ACTIVE]
    │       ├── Step bootstrap_deploy [NOT ACTIVE]
    │       ├── Step firstboot_config [NOT ACTIVE]
    │       ├── Step cluster_services [NOT ACTIVE]
    │       ├── Step statefulset [NOT ACTIVE]
    │       └── Step cleanup [NOT ACTIVE]
    └── Plan node_update (serial strategy) [IN_PROGRESS], last updated 2020-07-03 16:14:43
        └── Phase deploy (serial strategy) [IN_PROGRESS]
            ├── Step config [COMPLETE]
            └── Step statefulset [IN_PROGRESS]
```

If you watch the output of `kubectl get pods` during this operation, we first see the two additional nodes get deployed, and then the remaining original nodes get restarted one at a time, which is exactly the behaviour we are looking for. You can test the reverse by doing :

```
operator $ kubectl kudo update --instance galera-instance -p NODE_COUNT=3
Instance galera-instance was updated.
```

At this point our operator can scale up and down, but we may have a problem when scaling down. If a node in a Galera cluster isn’t synchronised when it’s removed from the cluster, this can cause issues with the cluster state, so we need to ensure that our nodes are synchronized before we terminate them. 

To do this, we’ll add a script that checks the status, and then we’ll modify our StatefulSet spec to add a [preStop check]( https://kubernetes.io/docs/concepts/containers/container-lifecycle-hooks/). Firstly let’s add the script to our original deploy plan:

```yaml
          - name: node_scripts
            tasks:
              - node_scripts

    - name: node_scripts
      kind: Apply
      spec:
        resources:
          - node_scripts.yaml
```

And now lets create that script :

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: {{ .Name }}-node-scripts
  namespace: {{ .Namespace }}
  wait-for-sync.sh: |
    until mysql -u root -p{{ .Params.MYSQL_ROOT_PASSWORD }} -e "SHOW GLOBAL STATUS LIKE 'wsrep_local_state_comment';" | grep -q Synced 
    do
        echo "Waiting for sync"
        sleep 5
    done
```

And we'll also configure our stateful set to mount it :

```yaml
        volumeMounts:
        - name: {{ .Name }}-config
          mountPath: /etc/mysql/conf.d
        - name: {{ .Name }}-datadir
          mountPath: /var/lib/mysql
        - name: {{ .Name }}-node-scripts
          mountPath: /etc/galera/wait-for-sync.sh
          subPath: wait-for-sync.sh
      volumes:
      - name: {{ .Name }}-config
        configMap:
          name: {{ .Name }}-nodeconfig
          items:
            - key: galera.cnf
              path: galera.cnf
            - key: innodb.cnf
              path: innodb.cnf
      - name: {{ .Name }}-node-scripts
        configMap:
          name: {{ .Name }}-node-scripts
          defaultMode: 0755
```

We are mounting the script directly as a sub path from the ConfigMap, although it’s worth noting that there are some [limitations]( https://kubernetes.io/docs/tasks/configure-pod-container/configure-pod-configmap/) when using subPaths.

We also need to ensure that our StatefulSet pods are scheduled on to separate nodes in our Kubernetes cluster, to protect us from node failures. We can do this with AntiAffinity rules, and we want to make this configurable so we can turn it off for testing. In our `statefulset.yaml`, let’s create a conditional section :

```yaml
spec:
      {{ if eq .Params.ANTI_AFFINITY "true" }}
      affinity:
        podAntiAffinity:
          requiredDuringSchedulingIgnoredDuringExecution:
            - labelSelector:
                matchExpressions:
                  - key: "app"
                    operator: In
                    values:
                    - galera
                  - key: "instance"
                    operator: In
                    values:
                    - {{ .Name }}
              topologyKey: "kubernetes.io/hostname"
     {{ end }}
```

And in `params.yaml` let’s make a parameter to control that :

```
  - name: ANTI_AFFINITY
    description: "Enforce pod anti-affinity"
    default: False
```

So now our operator can manage node affinity, safely scale up and down, and has connectivity for external clients ! 

At this point, we can try some benchmarks, and scale our cluster up and down whilst doing so to make sure that everything works correctly. I used https://www.percona.com/blog/2020/02/07/how-to-measure-mysql-performance-in-kubernetes-with-sysbench/ to do this. 

So in the three parts of this blog, we’ve seen how to build KUDO operators up piece by piece and how to test them while we are doing so. We’ve also seen various examples of how to use templating - including conditionals, using the built in variables provided by KUDO, and Sprig functions. 

In future blogs in this series, I will continue to develop the Galera operator, adding additional functionality and custom plans to expand its feature set for more day 2 operations. 

<Authors about="mattj-io" />
