# CLI Usage

This document demonstrates how to use the CLI but also shows what happens in KUDO under the hood, which can be helpful when troubleshooting.

<h2>Table of Contents</h2>

[[toc]]



## Flags

::: tip Usage
`kubectl kudo install <name> [flags]`
:::

::: flag --app-version (string)
A specific app version in the official GitHub repo. (default to the most recent)
:::

::: flag --auto-approve
Skip interactive approval when existing version found. (default `false`)
:::

::: flag -h, --help
Help for install
:::

::: flag --home (string)
The file path to KUDO configuration folder. (default: "$HOME/.kudo")
:::

::: flag --instance (string)
The instance name. (default: Operator name)
:::

::: flag --kubeconfig (string)
The file path to Kubernetes configuration file. (default: "$HOME/.kube/config")
:::

::: flag --namespace (string)
The namespace used for the operator installation. (default: "default")
:::

::: flag --operator-version (string)
A specific operator version on the official GitHub repo. (default to the most recent)
:::

::: flag --app-version (string)
A specific application version on the official GitHub repo. (default to the most recent)
:::

::: flag -p, --parameter (stringArray)
The parameter name and value separated by '='. See also `-P`
:::

::: flag -P, --parameter-file (stringArray)
Path to a YAML file with parameter values. The top-level element in this file must be a mapping,
where keys are parameter names and values are the parameter values.

See [the section on installing with overrides](#install-a-package-overriding-instance-name-and-parameters) below
for an example of a parameter value file.

This is useful if you want to keep your instances' parameter values in version control,
or for specifying particularly complex or long parameter values which are inconvenient
to handle in shell command line.

Parameters are collected by first reading the files specified with `--parameter-file`/`-P` (in the order specified)
and then from values specified with `--parameter`/`-p`. Last encountered value of a given parameter wins.
This lets you define defaults in one or more files, and override them on the command line as needed.
:::

::: flag --repo (string)
The name of the repository in the `repo list` configuration to use. (default to configured repository context)
:::


