# Developing Operators

This guide will provide introduction to creating KUDO operators, you will learn about the structure of the package and the template language to use.

## Getting Started
In this section we’ll start by developing your first operator and we’ll follow up with in-depth explanation of the underlying concepts.

A package bundles all files needed to describe an operator. The overall structure of a package looks following:
```bash
.
├── operator.yaml
├── params.yaml
└── templates
    ├── deployment.yaml
    └── ...
```

The `operator.yaml` is the main YAML file defining both operator metadata as the whole lifecycle of the operator. `params.yaml` defines parameters of the operator. During installation, these parameters can be overridden allowing customization. `templates` folder contain all templated Kubernetes objects that will be applied to your cluster after installation based on the workflow defined in `operator.yaml`.

### Your First KUDO Operator
First let’s create `first-operator` folder and place an `operator.yaml` in it.

<<< @/kudo/test/integration/first-operator-test/first-operator/operator.yaml

This is an operator with just one plan `deploy`, which has one phase and one step and represents the minimal setup. The `deploy` plan is automatically triggered when you install an instance of this operator into your cluster.

You can see that the task `nginx` references the resource `deployment.yaml`. KUDO expects this file to exist inside the `templates` folder. As the next step, create `templates/deployment.yaml`:

<<< @//kudo/test/integration/first-operator-test/first-operator/templates/deployment.yaml

This is a pretty normal Kubernetes YAML file defining a deployment. However, you can already see the KUDO templating language in action on the line referencing `.Params.replicas`. This will get substituted during installation by merging what is in `params.yaml` and overrides defined before install. So let’s define the last missing piece, `params.yaml` (which goes into the root first-operator folder next to `operator.yaml`).

<<< @/kudo/test/integration/first-operator-test/first-operator/params.yaml

Now your first operator is ready and you can install it to your cluster. You can do this by invoking `kubectl kudo install ./first-operator` where `./first-operator` is a relative path to the folder containing your operator. To do this, you need to have the KUDO CLI installed - [follow the instructions here](cli.md), if you haven't already. Various resources will be installed for your operator, among them `Operator`, `OperatorVersion` and `Instance` as described in [concepts](concepts.md).

**Note:** If you want to install the result of the following steps with doing them manually, you can clone the KUDO repository and run the example from there:

```bash
git clone https://github.com/kudobuilder/operators.git
cd operators
kubectl kudo install ./repository/first-operator/operator/
```

In order to see what's happen in your cluster you can run the following command:

```bash
# Get Instances
kubectl get instances

# OR
kubectl kudo get instances
```

If all worked fine, you should see 2 pods running

```bash
kubectl get pods
```

## Operator.yaml File

This is the main piece of every operator. It consists of two main parts. First one defines metadata about your operator.
Most of these are provided as a form of documentation. `kudoVersion` and `kubernetesVersion` use semver constraints to define minimal or maximal version of Kubernetes or KUDO that this operator supports. Under the hood, we use [this library](https://github.com/Masterminds/semver) to evaluate the constraints.

### Tasks Section

Another part of `operator.yaml` is the tasks section. Tasks are the smallest pieces of work that get executed together. You usually group Kubernetes manifests that should be applied at once into one task. An example can be an app that will result in `deployment.yaml` being applied to your cluster.

### Plans Section

Plans orchestrate tasks through `phases` and `steps`.

Each plan is a tree with a fixed three-level hierarchy of the plan itself, its phases (named collection of steps), and then steps within those phases. This three-level hierarchy can look as follows:

```text
Plan foo
├─ Phase bar
│  ├─ Step qux
│  └─ Step quux
└─ Phase baz
   ├─ Step quuz
   ├─ Step corge
   └─ Step grault
```


Plans consists of one or more `phases`. `Phases` consists of one or more `steps`. `Steps` contain one or more `tasks` (those are defined in the section we talked about in the last paragraph). Both phases and also steps can be configured with an execution `strategy`, either `serial` or `parallel`.

The sample has a `deploy` plan with a phase `main` and a step `everything`. From `everything` the `app` is referenced. This task gets executed when an instance is created using the operator.

At the same time, `deploy` plan is the most important plan within your operator because that is the default plan that every operator has to have and also the plan that gets executed when you install an instance of your operator into the cluster. Another important plan that you might consider having is `update` (run when instance metadata is updated) or `upgrade` (run when instance is upgraded from one version of the operator to another). If you don't provide `update` and/or `upgrade` plans for your operator, the fallback is always `deploy`.

Plans allow operators to see what the operator is currently doing, and to visualize the broader operation such as for a config rollout. The fixed structure of that information meanwhile makes it straightforward to build UIs and tooling on top.

## Params File

`params.yaml` defines all parameters that can be used to customize your operator installation. You have to define the name of the parameter and optionally a default value. If not specified otherwise, all parameters in this list are treated as required parameters. For parameters that don't specify default values, you must provide a value during installation, otherwise the installation will fail.

A more detailed example of `params.yaml` may look as following:

```yaml
apiVersion: kudo.dev/v1beta1
parameters:
  - name: BACKUP_FILE
    description: "Filename to save the backups to"
    default: "backup.sql"
    displayName: "BackupFile"
  - name: PASSWORD
    default: "password"
    trigger: backup
  - name: OPTIONAL_PARAM
    description: "This parameter is not required"
    required: False
  - name: REQUIRED_PARAM
    description: "This parameter is required but does not have a default value"
    required: True
```

Let's look at these parameters:
* The `BACKUP_FILE` parameter provides a default value, so a user does not need to specify anything unless they want to change that value.
* The `OPTIONAL_PARAM` is explicitly not required, so even though it doesn't come with a default value, not providing a value for this parameter won't fail the installation.
* The `REQUIRED_PARAM` is required but does not provide a default value. For such parameters, users are expected to provide a value for `kubectl kudo install youroperator -p REQUIRED_PARAM=value`.
* The `PASSWORD` parameter exposes one more feature of `params.yaml`: you can `trigger` specific plans when changing a parameter.

### Triggers

`trigger` is an optional field which points to an existing plan in `operator.yaml`. When you update a parameter after an instance has been installed, the plan specified gets triggered as a result of your change. In other words, this plan will apply the parameter change to your Kubernetes objects. If no trigger is specified, the `update` plan will be triggered by default. If no `update` plan exists for this operator, the `deploy` plan is run.

## Templates

Everything that is placed into the templates folder is treated as a template and passed on to the KUDO controller for rendering. KUDO uses the [Sprig template library](https://godoc.org/github.com/Masterminds/sprig) for server side templates rendering during installation. Thanks to Sprig you can use tens of different functions inside your templates. Some of them are inherited from [go templates](https://godoc.org/text/template), some of them are defined by [Sprig](https://godoc.org/github.com/Masterminds/sprig) itself. See their documentation for reference.

### Variables Provided by KUDO

- `.OperatorName` - name of the operator the template belongs to
- `.Name` - name of the instance to which Kubernetes objects created from this template will belong to
- `.AppVersion` - version of the image that could be used as the container image tag in statefulset.yaml or deployment.yaml
- `.Namespace` - namespace in which instances are created
- `.Params` - an object containing the list of parameters you defined in `params.yaml` with values you specified, or provided via overrides during installation

A more complex example using some of the built-in variables could look like the following `templates/service.yaml`

```yaml
apiVersion: v1
kind: Service
metadata:
  name: {{ .Name }}-svc
  namespace: {{ .Namespace }}
  {{ if eq .Params.METRICS_ENABLED "true" }}
  labels:
    "kudo.dev/servicemonitor": "true"
  {{ end }}
spec:
  ports:
    - port: {{ .Params.BROKER_PORT }}
      name: server
    {{ if eq .Params.TRANSPORT_ENCRYPTION_ENABLED "true" }}
    - port: {{ .Params.BROKER_PORT_TLS }}
      name: server-tls
    {{ end }}
    - port: {{ .Params.CLIENT_PORT }}
      name: client
    {{ if eq .Params.METRICS_ENABLED "true" }}
    - port: {{ .Params.METRICS_PORT }}
      name: metrics
    {{ end }}
  clusterIP: None
  selector:
    app: kafka
    kudo.dev/instance: {{ .Name }}
```

## Testing Your Operator

You should aim for your operators being tested for day 1. To help you with testing your operator, we have developed a tool called test harness (it's also what we use to test KUDO itself). For more information please go to [test harness documentation](testing.md).
