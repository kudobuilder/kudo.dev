# Operator Parameters

This document explains what operator parameters are and how they work in KUDO.

## What are operator parameters

Operator parameters are key-value pairs declared by the operator developer.

The operator user may [override](#overriding-parameters) their values at deployment time.
This allows customizing the behavior of an operator.

## Declaring parameters

Operator developer declares parameters in a `params.yaml` file.
This file is mandatory and must be present in the root directory of an operator.

If the operator developer does not wish to provide any parameters, the file may be empty.

The following example illustrates the structure of the file:

```yaml
apiVersion: kudo.dev/v1beta1
parameters:
  - name: BACKUP_FILE
    description: "Filename to save the backups to."
    default: "backup.sql"
    displayName: "BackupFile"
  - name: PASSWORD
    default: "password"
    trigger: backup
  - name: OPTIONAL_PARAM
    description: "This parameter is not required."
    required: False
  - name: REQUIRED_PARAM
    description: "This parameter is required but does not have a default value."
    required: True
  - name: ARRAY_PARAM
    description: "This parameter describes an array of values."
    default:
      - user1
      - user2
    type: array
  - name: MAP_PARAM
    description: "This parameter describes a map of values."
    default:
      label1: foo
      label2: bar
    type: map
```

A parameter declaration consists of the following attributes:

::: attribute name
Provides a name of the parameter. Required.
It is a convention to use upper-case and separate words with underscores.
:::

::: attribute displayName
Provides an alternative name of the parameter. Optional.
Currently not used anywhere.
May be used by user interfaces to KUDO.
:::

::: attribute description
A description of the purpose of the parameter. Optional.
Currently not used anywhere.
May be used by user interfaces to KUDO.
:::

::: attribute type
The type of the parameter value. Optional.
By default, a parameter value is a string. Arrays or maps can be provided by using `array` or `map` here.
In that case the default value can be provided as YAML.
:::

::: attribute default
A default value of the parameter. Optional.
Note that omitting this attribute will make the parameter required by default.
You may change that with the `required` attribute.
:::

::: attribute required
Whether a value for this parameter must be [explicitly provided at installation time](#overriding-parameters). Optional.
Failure to provide a value at installation time will prevent installation from happening.
:::

::: attribute trigger
Which [plan should be triggered](#triggers) when this parameter is changed after initial installation. Optional.
If you do not specify this attribute, the `update` or `deploy` [plan will be triggered](#triggers).
:::

## Overriding parameters

Parameter values may be overridden from the CLI by the operator user.

The `install`, `upgrade` and `update` subcommands of `kubectl kudo` take the `--parameter` flag
(which may be abbreviated as `-p`).

The argument to that flag has the form `PARAMETER_NAME=parameter_value`.

This flag may be specified many times to change more parameters in a single run.

## Triggers

Operator developer may specify the name of the [plan](plans.md) which should be triggered
when the value of this parameter is changed in an update.

In other words, this plan will apply the parameter change to your Kubernetes application.

If no trigger is specified, the `update` plan will be triggered by default.

If no `update` plan exists for this operator, the `deploy` plan is triggered.

::: warning
It is currently not specified what happens when a single update changes parameters which refer
to more than one trigger plan.
:::
