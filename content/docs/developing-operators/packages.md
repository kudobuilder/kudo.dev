# Anatomy of an Operator

A package bundles all files needed to describe an operator. The structure of a package looks following:

```bash
.
├── operator.yaml
├── params.yaml
└── templates
    ├── deployment.yaml
    └── ...
```

::: attribute operator.yaml
`operator.yaml` is the main YAML file defining both operator metadata as the whole lifecycle of the operator. [Tasks](tasks.md) and [plans](plans.md) are defined in this file. Metadata that provide the name, version and maintainers of the operator are set here as well.
:::

::: attribute params.yaml
`params.yaml` defines [parameters](parameters.md) of the operator. During installation, these parameters can be overridden allowing customization.
:::

::: attribute templates/
The `templates` folder contains all templated Kubernetes objects that will be applied to your cluster after installation based on the workflow defined in `operator.yaml`. Templating is described [here](templates.md)
:::
