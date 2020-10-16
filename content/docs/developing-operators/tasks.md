# Tasks

## Overview

A task is the basic building block in the KUDO workflow. Plans, phases, and steps are control structures that execute tasks at the end. You've already come across an Apply-task when developing your [first-operator](getting-started.md). KUDO offers following main task types: `Apply`, `Delete`, `Pipe`, `Toggle` and `KudoOperator`. Additionally, there is a `Dummy` task which is helpful when debugging and testing your operator. All KUDO tasks are defined in the [operator.yaml](packages.md) and must have three fields:

```yaml
tasks:
  - name: # Task name defined by the user
    kind: # Task kind can be: Apply, Delete, Pipe, Toggle, KudoOperator and Dummy
    spec: # Task-specific specification
```

Let's take a look at an individual task type in detail.

## Apply-Task

An apply-task applies (!) templates to the cluster. Pretty simple. Its `spec.resources` field defines a list of Kubernetes resources that will be either created (if they don't exist) or updated (if present). Given a definition like the one from the [first-operator](getting-started.md):

```yaml
tasks:
  - name: app
    kind: Apply
    spec:
      resources:
        - deployment.yaml
```

a task named `app` will create a deployment resource defined in `templates/deployment.yaml`.

KUDO will apply all the listed resources and wait for all of them to become healthy. "Health" is dependent on the particular resource: a [deployment](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/) must have a defined number of spec instances up and running, a [Job](https://kubernetes.io/docs/concepts/workloads/controllers/jobs-run-to-completion/) must finish successfully and e.g. a [ConfigMap](https://cloud.google.com/kubernetes-engine/docs/concepts/configmap) will be simply created in the cluster.

**Note:** current implementation will apply all resources in the given order so that e.g. a Pod can mount previously created ConfigMap. However, this is not part of the specification and might change in the future (all resources can be applied concurrently). If you need [happens-before-guarantee](https://en.wikipedia.org/wiki/Happened-before) between your resources, use e.g. multiple serial steps.

The apply-task enhances deployed resources with KUDO specific labels and annotations. For resources that create or deploy pods (StatefulSets, Deployments, Daemonsets, etc. ) KUDO adds a special annotation to the pod template spec that is the hash from all resources used by the pod template spec (ConfigMaps and Secrets). The effect of this hash is that an update to an operator parameter that changes a ConfigMap triggers a restart of the pods that uses that ConfigMap.

**Note:** The pods will only be restarted when the parent resource (StatefulSet, Deployment) is applied. This can happen in the same task as the dependency or a task that is executed later in the same plan. This means, if a plan applies only a config map but not the stateful set which uses the config map, the pods will *not* be restarted when the plan is executed. The change will be detected the next time the stateful set is applied though, even if that happens later and in a different plan. 

**Note:** To exclude a ConfigMap or Secret from triggering a pod restart, you can add the annotation `kudo.dev/skip-hash-calculation` with any value to the ConfigMap or Secret. 

## Delete-Task

A delete-task looks very similar to an apply-task, however, it will delete resources instead of creating them. Let's create a task that will uninstall the app we created above:

```yaml
tasks:
  - name: remove
    kind: Delete
    spec:
      resources:
        - deployment.yaml
```

**Note:** deleting non-existing resources is always successful. As of version 0.9.0, KUDO will not wait for the resource to be actually removed and will finish the task when the API server accepts the deletion request. So in case of Pods, Kubernetes imposes a default graceful termination period of 30 seconds, however, a delete-task will be done before that. KUDO 0.9.0 will not wait for [resource finalizers](https://kubernetes.io/docs/concepts/workloads/controllers/garbage-collection/) should they exist.


## Toggle-Task

Developing features for operators sometimes requires enabling and disabling resources.
A toggle-task applies or deletes resources based on a parameter boolean value.
Let's add a service for an operator based on the parameter `enable-service`:

```yaml
tasks:
  - name: app-service
    kind: Toggle
    spec:
      parameter: enable-service
      resources:
        - service.yaml
```

This task will either apply or delete the resources defined in `templates/service.yaml` based on the `enable-service` parameter value.

If the `enable-service` parameter evaluates to `true` the task named `app-service` will create a service resource defined in `templates/service.yaml`. In case the `enable-service` parameter evaluates to `false`, the task named `app-service` will delete the service resource defined in `templates/service.yaml`.

The parameter `enable-service` must be defined in the `params.yaml` file otherwise the operator installation will fail. The parameter value should also render to a boolean value. In case the parameter value isn't a boolean the Toggle-Task will fail. 

## Pipe-Task

Developing complicated operators often require generating files in one step and reusing them in a later one. A common example is generating custom certificates/dynamic configuration files in the bootstrap step and using them in the later deployment step of the service. This is where pipe-tasks can help: you can generate files in one task and save them either as a [Secret](https://cloud.google.com/kubernetes-engine/docs/concepts/secret) or a [ConfigMap](https://cloud.google.com/kubernetes-engine/docs/concepts/configmap) for use in subsequent steps. Let's see it in action. We will extend [first-operator](getting-started.md) to generate a custom `index.html` page and deploy the Nginx server with it. Let's define a new pipe-task called `genwww`:

```yaml
tasks:
  - name: genwww
    kind: Pipe
    spec:
      pod: pipe-pod.yaml
      pipe:
        - file: /tmp/index.html
          kind: ConfigMap
          key: indexHtml
```

Pipe-task spec has two fields: a `pod` spec which will generate our `index.html` and a `pipe` spec which defines a list of files that will be persisted. Here we'll generate a `/tmp/index.html` file that we'll save as a `ConfigMap`. It can be referenced within template resources with the key `indexHtml` (more about that below). Pipe-task `spec.pod` field must reference a [core/v1 Pod](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.10/#pod-v1-core) template. However, there are limitations. Reasons for that are explained in the [corresponding KEP](https://github.com/kudobuilder/kudo/blob/master/keps/0017-pipe-tasks.md). In a nutshell:

- A pipe-pod should generate artifacts in a [initContainer](https://kubernetes.io/docs/concepts/workloads/pods/init-containers/)
- It has to define and mount one [emptyDir volume](https://kubernetes.io/docs/concepts/storage/volumes/#emptydir) where generated files are stored

Let's take a look at `templates/pipe-pod.yaml`:

```yaml
apiVersion: v1
kind: Pod
spec:
  volumes:
  - name: shared-data
    emptyDir: {}
  initContainers:
    - name: init
      image: busybox
      command: [ "/bin/sh", "-c" ]
      args:
        - wget -O /tmp/index.html 'http://cowsay.morecode.org/say?message=Good+things+come+when+you+least+expect+them&format=html'
      volumeMounts:
        - name: shared-data
          mountPath: /tmp
```

Here we use an online [cowsay-generator](http://cowsay.morecode.org) API to generate and download an `index.html` file and save in the mounted volume under `/tmp/index.html` path.

Given the above pipe-pod and `genwww` task specification, KUDO will run the pipe-pod, wait for the successful generation of the `index.html`, copy it out and save it as a ConfigMap. Now, this file is ready to be used in our Nginx deployment spec. Let's extend the `templates/deployment.yaml` to mount the generated file:

```yaml
...
spec:
  containers:
    - name: nginx
      image: nginx:1.7.9
      ports:
        - containerPort: 80
      volumeMounts:
        - name: www
          mountPath: /usr/share/nginx/html/
  volumes:
    - name: www
      configMap:
        name: {{ .Pipes.indexHtml }}
```

We successfully created a [mount volume from the ConfigMap](https://kubernetes.io/docs/tasks/configure-pod-container/configure-pod-configmap/#populate-a-volume-with-data-stored-in-a-configmap). Note the parametrized ` {{ .Pipes.indexHtml } }` configMap name. `.Pipes` keyword allows us to address pipe-artifacts and `indexHtml` is the key we defined in the pipe-task above.

Now that we've prepared our pipe-task and the corresponding resources we can use it as part of the deploy plan:

```yaml
...
plans:
  deploy:
    strategy: serial
    phases:
      - name: main
        strategy: serial
        steps:
          - name: genfiles
            tasks:
              - genwww
          - name: app
            tasks:
              - app
```

**Note** that the `main` phase has a `serial` strategy. We need to wait for the `genfiles` step to finish successfully before pipe-artifact can be used in a subsequent step.

Once our Nginx server is up and running we should be able to read a pearl of cow wisdom:

```text
  ______________________________________
/ Good things come when you least expect \
\ them                                   /
  --------------------------------------
         \   ^__^
          \  (oo)\_______
             (__)\       )\/\
                 ||----w |
                 ||     ||
```

**Note:**

- File generating Pod has to be side effect free (meaning side effects that are observable outside of the container like a 3rd party API call) as the container might be executed multiple times on failure. A `restartPolicy: OnFailure` is used for the pipe-pod
- Only files <1Mb are applicable to be stored as ConfigMap or Secret. A pipe-task will fail should it try to copy files >1Mb
- As of KUDO 0.9.0 pipe-artifacts can only be used within the same plan they were generated
- You can pipeline artifacts by creating them in one pipe-task and mounting in a subsequent one

Full cowsay-operator can be found in the [KUDO operators repo](https://github.com/kudobuilder/operators/tree/master/repository/cowsay).

## KudoOperator-Task

As of KUDO 0.15.x, KUDO supports a `KudoOperator` task which allows you to specify a dependency on other operators. While dependencies in general is a complicated topic, `KudoOperator` itself is about installation dependencies i.e. your operator instance and all its dependencies (including transitive ones) will be installed and/or removed as one unit.

KUDO operators already have a mechanism to deal with installation dependencies called [plans, phases, and steps](plans.md) with serial or parallel execution strategy. This mechanism is already powerful enough to express any dependency hierarchy including transitive dependencies.

Here a simple example of a task specifying a dependency on the community Zookeeper operator version 0.3.0 (which will install [zookeeper 3.4.14](https://github.com/kudobuilder/operators/blob/master/repository/zookeeper/README.md))

```yaml
tasks:
  - name: deploy-zookeeper
    kind: KudoOperator
    spec:
      package: zookeeper
      operatorVersion: 0.3.0
```

As with other tasks, KUDO will make sure this task is healthy before moving to the next one. In the example below we split the `deploy` plan into two phases: _prereqs_ and _main_:
 
```yaml
plans:
  deploy:
    strategy: serial
    phases:
      - name: prereqs
        strategy: parallel
        steps:
          - name: first
            tasks:
              - deploy-zookeeper
      - name: main
        strategy: parallel
        steps:
          - name: second
            tasks:
              - deploy-main
```

"Healthy", in the case of the operator means that its `deploy` plan is _COMPLETE_. `KudoOperator` closely mimics the `kubectl kudo install` command semantics allowing to additionally specify the `appVersion` (defaults to most recent one) and the `instanceName` (will be generated by KUDO by default).

As with `kubectl kudo install` command, a local operator (or remote tarball) can be specified in the `package` field e.g. `package: "./child-operator"`. During installation of the parent operator, KUDO CLI will resolve the child dependency, parse the operator and create the necessary resources. If the dependency is local and has a relative path e.g. `./child-operator` then:

  - it is **always** relative to the `operator.yaml` where it is defined
  - it has to be prefixed with either `./` or `../` (similar to [kudo install](https://kudo.dev/docs/cli/commands.html#install) command)
  
So given an operator tree structure like:
  
```bash
.
├── child
│   └── operator.yaml
│
└── parent
    └── operator.yaml
```

child operator in the `parent/operator.yaml` has to be referenced like:

```bash
  - name: child
    kind: KudoOperator
    spec:
      package: "../child"
```

### Dependency Parametrization

If a child operator needs to be parametrised a parameter file can be specified using the `parameterFile` field. Let's take a look at an example. Suppose, we have two operators (_parent_ and _child_) and _child_ has a required parameter `PASSWORD` which is empty by default. First, the parent operator needs to specify a  parameter file for the child and reference it in the corresponding `KudoOperator` task:

```yaml
tasks:
  - name: deploy-child
    kind: KudoOperator
    spec:
      package: child-operator
      parameterFile: child-params.yaml 
```

`child-params.yaml` is located in the parents _template_ folder along with other template files:

```yaml
# parent/templates/child-params.yaml
PASSWORD: {{ .Params.CHILD_PASSWORD }}
```

Child `PASSWORD` value references the parent `CHILD_PASSWORD` parameter that can look like:

```yaml
# parent/params.yaml
apiVersion: kudo.dev/v1beta1
parameters:
  - name: CHILD_PASSWORD
    displayName: "child password"
    description: "password for the underlying instance of child operator"
    required: true
```

When installing the _parent_ operator the user then has to define the `CHILD_PASSWORD` as usual:

```shell script
$ kubectl kudo install parent -p CHILD_PASSWORD=secret
```

Note, that the _parent_ operator may decide to provide a sensible default or even to hardcode the password and not expose it at all to the end user. Overall we wanted to encourage operator composition by providing a way of operator encapsulation. In other words, operator users should not be allowed to arbitrarily modify the parameters of embedded operator instances. The higher-level operator should define all parameters that its direct dependency operators need.

For more information and implementation details, take a look at the [KEP-29](https://github.com/kudobuilder/kudo/blob/main/keps/0029-operator-dependencies.md)

## Dummy-Task

A dummy-task can succeed or fail on-demand and is useful for testing and debugging the KUDO operator workflow.

```yaml
tasks:
  - name: breakpoint
    kind: Dummy
    spec:
     wantErr: true # If true, the task will fail with a transient error
     fatal: true # If true and wantErr: true, the task will fail with a fatal error
     done: false # if true, the task will succeed immediately
```

Such a task is useful as a breakpoint in an operator workflow, allowing the operator developer to pause or fail an execution in an arbitrary step.

**Note:**

- A `wantErr` will take precedence over `done`
- If a fatal error is wanted, both `wantErr` and `fatal` should be set to true
- If all three fields are `false` a task will effectively pause (simulating an unhealthy resource)
