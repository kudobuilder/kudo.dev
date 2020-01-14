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
Gets the name of the operator (TODO: link to Operator)
:::

::: flag .Name
Gets the name of the current instance (TODO: link to Instance)
:::

::: flag .Namespace
Gets the name of the instance's namespace
:::

::: flag .Pipes
Gets pipeline parameters (TODO: Link to pipelines)
:::

::: flag .PlanName
Gets the name of the instance's active plan (TODO: link to plan)
:::

::: flag .PhaseName
Gets the name of the instance's active phase (TODO: link to phase)
:::

::: flag .StepName
Gets the name of the instance's active step (TODO: link to step)
:::

::: flag .AppVersion
Gets the application version
:::

## Functions

Functions transform input like variables. Pipelines allow to use the result of a function as the input of another function. The functions provided by [Go templates](https://golang.org/pkg/text/template/#hdr-Functions) and [Sprig](https://masterminds.github.io/sprig/) allows one to

* compare values (`not`, `eq`, `ne`, `lt`, ...)
* make simple calculations (`len`, `and`, `or`, `add`, `mul`, ...)
* manipulate text (`html`, `js`, `trim`, `wrap`, ...)

## Actions

Use actions to provide branching or repetition in templates. Below are some examples on how to use functions in operator templates. The [documentation for Go templates](https://golang.org/pkg/text/template/#hdr-Actions) has more details on its features.

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

This example create [persistent volume claims](https://kubernetes.io/docs/concepts/storage/persistent-volumes/#persistentvolumeclaims) for each volume.

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
