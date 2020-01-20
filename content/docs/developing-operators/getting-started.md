# Getting Started

## Prerequisites

It's time to create your first operator. But before you proceed, make sure you're up-to-date on all the important KUDO concepts:

* [Operator packages](packages.md)
* [Plans](developing-operators/plans.md)
* [Tasks](developing-operators/tasks.md)
* [Parameters](developing-operators/parameters.md)
* [Templates](developing-operators/templates.md)

## Package Structure

Our first operator will deploy Nginx to the cluster. If you're thinking that one doesn't need a KUDO operator to do this, you're absolutely right. It hardly showcases KUDOs strong sides but this is a `hello-world` type of operator and we have to start somewhere.

Create a new folder `./first-operator` that will contain the operator (also known as a local package bundle). The overall structure of a package looks following:

```bash
.
├── operator.yaml
├── params.yaml
└── templates
    └── deployment.yaml
```

The `operator.yaml` is the main YAML file defining both operator metadata as the whole lifecycle of the operator. `params.yaml` defines parameters of the operator. During installation, these parameters can be overridden allowing customization. `templates` folder contain all templated Kubernetes objects that will be applied to your cluster after installation based on the workflow defined in `operator.yaml`.

## Operator Substance

First let’s create an `operator.yaml` file in the `./first-operator`.

<<< @/kudo/test/integration/first-operator-test/first-operator/operator.yaml

This is an operator with just one plan `deploy`, which has one phase and one step and represents the minimal setup. The `deploy` plan is automatically triggered when you install an instance of this operator into your cluster.

You can see that the task `nginx` references the resource `deployment.yaml`. KUDO expects this file to exist inside the `templates` folder. As the next step, create `templates/deployment.yaml`:

<<< @//kudo/test/integration/first-operator-test/first-operator/templates/deployment.yaml

This is a pretty normal Kubernetes YAML file defining a deployment. However, you can already see the KUDO templating language in action on the line referencing `.Params.replicas`. This will get substituted during installation by merging what is in `params.yaml` and overrides defined before install. So let’s define the last missing piece, `params.yaml` (which goes into the root first-operator folder next to `operator.yaml`).

<<< @/kudo/test/integration/first-operator-test/first-operator/params.yaml

Now your first operator is ready and you can install it to your cluster. You can do this by invoking `kubectl kudo install ./first-operator` where `./first-operator` is a relative path to the folder containing your operator. To do this, you need to have the KUDO CLI installed - [follow the instructions here](cli.md), if you haven't already. Various resources will be installed for your operator, among them `Operator`, `OperatorVersion` and `Instance`, as described in, [What is KUDO](../what-is-kudo.md).

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

## Testing Your Operator

You should aim for your operators being tested for day 1. To help you with testing your operator, we have developed a tool called test harness (it's also what we use to test KUDO itself). For more information please go to [test harness documentation](testing.md).
