# Templates

KUDO uses the [template engine of the Go language](https://golang.org/pkg/text/template/). [Sprig template functions](http://masterminds.github.io/sprig/) are available as well. This gives users powerful tools to parameterize operator functionality.

Templates are applied to every file in the `templates` directory of an operator package.

## Variables

::: v-pre
To access the value of a variable, use `{{ .Variable }}`. The following variable are available for each template:
:::

::: flag .Params
::: v-pre
Access instance parameters defined in `params.yaml`. E.g., to get the value of a `REPLICAS` parameter, use `{{ .Params.REPLICAS }}`.
:::

::: flag .OperatorName
Gets the name of the [operator](../what-is-kudo.md#main-concepts)
:::

::: flag .Name
Gets the name of the current [instance](../what-is-kudo.md#main-concepts)
:::

::: flag .Namespace
Gets the name of the instance's namespace
:::

::: flag .Pipes
Gets pipeline [parameters](tasks.md#pipe-task)
:::

::: flag .PlanName
Gets the name of the instance's active [plan](plans.md)
:::

::: flag .PhaseName
Gets the name of the instance's active [phase](plans.md)
:::

::: flag .StepName
Gets the name of the instance's active [step](plans.md)
:::

::: flag .AppVersion
Gets the application version
:::

## Functions

Functions transform input like variables. Pipelines allow to use the result of a function as the input of another function. The functions provided by [Go templates](https://golang.org/pkg/text/template/#hdr-Functions) and [Sprig](https://masterminds.github.io/sprig/) allows one to

* compare values (`not`, `eq`, `ne`, `lt`, ...)
* make simple calculations (`len`, `and`, `or`, `add`, `mul`, ...)
* manipulate text (`html`, `js`, `trim`, `wrap`, ...)

Sprig functions that allow environment access are disabled. The respective functions are `env`, `expandenv`, `base`, `dir`, `clean`, `ext` and `isAbs`.

Additionally, KUDO provides the following custom functions:

::: flag toYaml
Returns a YAML representation of its argument. Its output
should usually be piped into `| trim | indent N`.
:::

## Actions

Use actions to provide branching or repetition in templates. Below are some examples on how to use functions in operator templates. The [documentation for Go templates](https://golang.org/pkg/text/template/#hdr-Actions) has more details on its features.

### Perform arithmetic using parameters

Note that all `.Params` have a type of `string`. You may need to use a function to convert a parameter to
a different type first.

This example subtracts 1 from a parameter:

```yaml
{{ sub (atoi .Params.NODE_COUNT) 1 }}
```

### Enable or disable features using a feature parameter

This example uses an HTTPS port if the `ENCRYPTION` parameter is "true". Otherwise it uses an HTTP port.

```yaml
spec:
  ports:
    {{ if eq .Params.ENCRYPTION "true" }}
    - name: https
      port: 443
    {{ else }}
    - name: http
      port: 80
    {{ end }}
...
```

### Create objects for a specified number

This example creates [persistent volume claims](https://kubernetes.io/docs/concepts/storage/persistent-volumes/#persistentvolumeclaims) for each volume.

```yaml
{{ range $i, $v := until (int .Params.VOLUMES) }}
---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: claim-{{ $i }}
...
{{ end }}
```

## Limitations

Some Kubernetes objects should not be templated. One prominent example are [Jobs](https://kubernetes.io/docs/concepts/workloads/controllers/job/). Job `Spec.Template` field is immutable and once the Job has been applied this field can not be changed. Trying to update `Spec.Template` via a templated parameter will result in an error like:

```bash
... failed to execute patch: Job.batch "xxx" is invalid: spec.template: Invalid value: core.PodTemplateSpec{...} field is immutable
```

A possible workaround is to delete the job (using a [Delete task](tasks.md#delete-task)) and recreate it, but that is the responsibility of the operator developer.
