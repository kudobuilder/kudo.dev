# Tasks

## Overview

A task is the basic building block in the KUDO workflow. Plans, phases, and steps are control structures that execute tasks at the end. You've already come across an Apply-task when developing your [first-operator](getting-started.md). KUDO (as of 0.9.0) offers three main task types: `Apply`, `Delete`, and `Pipe`. Additionally there is a `Dummy` task which is helpful when debugging and testing your operator. All KUDO tasks are defined in the [operator.yaml](packages.md) and must have three fields:

```yaml
tasks:
  - name: # Task name defined by the user
    kind: # Task kind can be these four: Apply, Delete, Pipe and Dummy
    spec: # Task-specific specification
```

Let's take a look at an individual task type in detail.

## Apply-Task

An apply-task applies (!) templates to the cluster. Pretty simple. Its `spec.resources` field defines a list of Kubernetes resources that will be either created (if don't exist) or updated (if present). Given a definition like the one from the [first-operator](getting-started.md):

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

## Pipe-Task

Developing complicated operators often require generating files in one step and reusing them in a later one. A common example is generating custom certificates/dynamic configuration files in the bootstrap step and using them in the later deployment step of the service. This is were pipe-tasks can help: you can generate files in one task and save them either as a [Secret](https://cloud.google.com/kubernetes-engine/docs/concepts/secret) or a [ConfigMap](https://cloud.google.com/kubernetes-engine/docs/concepts/configmap) for use in subsequent steps. Let's see it in action. We will extend [first-operator](getting-started.md) to generate a custom `index.html` page and deploy the Nginx server with it. Let's define a new pipe-task called `genwww`:

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

Pipe-task spec has two fields: a `pod` spec that will generate our `index.html` and a `pipe` spec that defines a list of files that will be persisted. Here we'll generate a `/tmp/index.html` file that we'll save as a `ConfigMap`. It can be referenced within template resources with the key `indexHtml` (more about that below). Pipe-task `spec.pod` field must reference a [core/v1 Pod](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.10/#pod-v1-core) template. However, there are limitations. Reasons for that are explained in the [corresponding KEP](https://github.com/kudobuilder/kudo/blob/master/keps/0017-pipe-tasks.md). In a nutshell:

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

- File generating Pod has to be side-effect free (meaning side-effects that are observable outside of the container like a 3rd party API call) as the container might be executed multiple times on failure. A `restartPolicy: OnFailure` is used for the pipe-pod
- Only files <1Mb are applicable to be stored as ConfigMap or Secret. A pipe-task will fail should it try to copy files >1Mb
- As of KUDO 0.9.0 pipe-artifacts can only be used within the same plan they were generated
- You can pipeline artifacts by creating them in one pipe-task and mounting in a subsequent one

Full cowsay-operator can be found in the [KUDO operators repo](https://github.com/kudobuilder/operators/tree/master/repository/cowsay).

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
