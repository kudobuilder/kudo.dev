# Commands

## Global flags

There are some global flags that can be appended to any command.

::: flag --home string
Location of your KUDO config. (default "~/.kudo")
:::

::: flag --kubeconfig string
Path to your Kubernetes configuration file. (default "~/.kube/config")
:::

::: flag -n, --namespace string
Target namespace for the object. (default "default")
:::

::: flag --request-timeout int
Request timeout value, in seconds.  Defaults to 0 (unlimited):::

::: flag -v, --v
Log level for verbose logs
:::

::: flag --validate-install
Validate KUDO installation before running the actual command. (default true)
:::

### Semi-global Flags

These flags are not really global, but a lot of commands have them. Use `--help` to see if a certain command supports it.

::: flag --help
All commands have this flag to show the usage details of that command.
:::

::: flag -o, --output
A lot of commands support this flag that allows machine parsable output. Usually you can specify "yaml" or "json". If the
the flag is not specified, human readable output is used. 
:::

::: flag --dry-run
Do not actually execute anything, run only checks and preparations for the command. Can often be combined with `--output` to
see which resources would be applied to the cluster.
:::


## init

Initializes or upgrades the KUDO server and client components.

::: tip Usage
`kubectl kudo init [flags]`
:::

### Flags to customize the installation

These flags customize the installation, especially the server part. At the moment these values are not saved in the
installation itself and have to be provided every time the init command is executed.

::: flag -n, --namespace string
For kudo init, the default is `kudo-system`. If a custom namespace is specified, the KUDO controller is installed in
this namespace. A custom namespace has to exist before installation and will not be created.
:::

::: flag -i, --kudo-image string
Override KUDO controller image and/or version
:::

::: flag --version string
Override KUDO controller version of the KUDO image
:::

::: flag --kudo-image-pull-policy string
Override KUDO controller image pull policy (default "Always")
:::

::: flag --service-account string
Override for the default serviceAccount. By default a service account "kudo-manager" is created with cluster-admin permissions.
 If a custom service account is provided, it has to exist and has to have cluster-admin permissions.
:::

::: flag --unsafe-self-signed-webhook-ca
Use self-signed CA bundle (for testing only) for the webhooks. By default KUDO expects [cert-manager](https://cert-manager.io/) 
to be installed, multiple versions are supported.
:::

### Other flags

::: flag --upgrade
Upgrade an existing KUDO installation
:::

::: flag --verify
Verify an existing KUDO installation
:::

::: flag --client-only
Only initialize the ~/.kudo directory and repository config, do not install any server side resources
:::

::: flag -w --wait
Block until KUDO manager is running and ready to receive requests
:::

::: flag --wait-timeout int
Wait timeout to be used (default 300) with `--wait`
:::

## get

Get information about installed instances

::: tip Usage
`kubectl kudo get instances [flags]`
:::

## search

Searches the repository for a match on "contains" search criteria

Given an operator named foo-demo, a search for 'foo' or 'demo' would include this operator.

By default, the command only shows the latest version of an operator. Use `--all-versions` to list all found versions.

::: tip Usage
`kubectl-kudo search [criteria] [flags]`
:::

::: flag --repo string
Name of repository configuration to use. (default defined by context)
:::

::: flag -a, --all-versions
Return all versions of found operators.
:::

## install

Install a KUDO package from local filesystem or the official repo.

The name argument must be a name of the package in the repository, a URL or path to package in *.tgz format,
  or a path to an unpacked package directory.

::: tip Usage
`kubectl-kudo install <name> [flags]`
:::

::: flag --app-version string
A specific app version in the official GitHub repo. (default to the most recent)
:::

::: flag --operator-version string
A specific operator version int the official GitHub repo. (default to the most recent)
:::

::: flag --repo string
Name of repository configuration to use. (default defined by context)
:::

::: flag --instance string
The Instance name. (defaults to Operator name appended with -instance)
:::

::: flag --skip-instance
If set, install will install the Operator and OperatorVersion, but not an Instance. (default "false")
:::

::: flag --create-namespace
If set, install will create the specified namespace and will fail if it exists. (default "false")
:::

::: flag -p, --parameter string=value
The parameter name and value separated by '='. For example `-p NODE_COUNT=3`
:::

::: flag -P, --parameter-file string
A YAML file with parameters
:::

::: flag --wait
Specify if the CLI should wait for the install to complete before returning (default "false")
:::

::: flag --wait-time int
Specify the max wait time in seconds for CLI for the install to complete before returning (default "300")
:::

::: warning
Be careful with local directories. If you call `kubectl kudo install flink` and you have a local
directory "flink", the local directory takes precedence over the remote directory.
:::


## plan

### plan status

Shows the plan status of the given instance.

This command supports `--output yaml`.

::: tip Usage
`kubectl kudo plan status --instance=<instanceName> [flags]`
:::

::: flag --wait
Specify if the CLI should wait for the plan to complete before returning (default "false")
:::

### plan history

Lists history for each plan of an instance.

::: tip Usage
 `kubectl kudo plan history --instance=<instanceName>`
:::

### plan trigger

Triggers a specific plan on a particular instance.

::: tip Usage
 `kubectl kudo plan trigger <planName> --instance=<instanceName> [flags]`
:::

::: flag --wait
Specify if the CLI should wait for the triggered plan to complete before returning (default "false")
:::

::: flag --wait-time int
Specify the max wait time in seconds for CLI for the triggered plan to complete before returning (default "300")
:::

## uninstall

Uninstall an instance of a KUDO package. This also removes dependent objects, e.g. deployments, pods. It will NOT remove
the OperatorVersion or Operator CRD.

::: tip Usage
 `kubectl-kudo uninstall --instance=<instanceName> [flags]`
:::

::: warning
This will uninstall the specified operator instance and may lead to data loss!
:::

## update

Update KUDO operator instance with new parameters. The update of parameters can trigger the execution of specific plans.

::: tip Usage
 `kubectl kudo update --instance=<instanceName> [flags]`
:::

::: flag -p, --parameter string=value
The parameter name and value separated by '='. For example `-p NODE_COUNT=3`
:::

::: flag -P, --parameter-file string
A YAML file with parameters
:::

::: flag --wait
Specify if the CLI should wait for the update to complete before returning (default "false")
:::

::: flag --wait-time int
Specify the max wait time in seconds for CLI for the update to complete before returning (default "300")
:::

::: tip Info
Updating the value of a parameter in an instance will trigger the plan which is specified in the parameter definition.
:::

## upgrade

Upgrade a KUDO package from the currently installed version to a new version. The upgrade argument must be a name of the 
package in the repository, a path to package in *.tgz format, or a path to an unpacked package directory.

Depending on the new operator version you may need to specify certain parameters, for example if the new operator version
has newly added required parameters.


::: tip Usage
 `kubectl kudo upgrade <operatorname> --instance=<instanceName> [flags]`
:::

::: flag --app-version string
A specific app version in the official GitHub repo. (default to the most recent)
:::

::: flag --operator-version string
A specific operator version int the official GitHub repo. (default to the most recent)
:::

::: flag --repo string
Name of repository configuration to use. (default defined by context)
:::

::: flag -p, --parameter string=value
The parameter name and value separated by '='. For example `-p NODE_COUNT=3`
:::

::: flag -P, --parameter-file string
A YAML file with parameters
:::

::: warning
Be careful with local directories. If you call `kubectl kudo upgrade flink --instance flink-instance` and you have a local
directory "flink", the local directory takes precedence over the remote directory.
:::

## diagnostics

Diagnostics provides functionality to collect and analyze diagnostics data

::: tip Usage
 `kubectl kudo diagnostics collect --instance=<instanceName> [flags]`
:::

::: flag --log-since duration
Only return logs newer than a relative duration like 5s, 2m, or 3h. Defaults to all logs.
:::

::: flag -O, --output-directory string
The output directory for the collected resources. Defaults to 'diag' (default "diag")
:::

## Development Commands

These commands are mostly interesting for operator developers.

### package

This command consists of multiple sub-commands to interact with KUDO packages.

It can be used to package or verify an operator, or list parameters.  When working with parameters it can 
provide a list of parameters from a remote operator given a url or repository along with the name and version.

::: flag add
Add content to an operator package files
:::

::: flag create
Package a local KUDO operator into a tarball.
:::

::: flag list 
List context from an operator package 
:::

::: flag new 
Wizard style helper to create new operator
:::

::: flag verify
Verify a package
:::

For more details please use `--help` with the CLI.

### repo

This command consists of multiple sub-commands to interact with KUDO repositories.

It can be used to add, remove, list, and index kudo repositories.

::: flag add
Add an operator repository
:::

::: flag context
Set default for operator repository context
:::

::: flag index
Generate an index file given a directory containing KUDO operator packages
:::

::: flag list
List operator repositories
:::

::: flag remove
Remove an operator repository
:::

For more details please use `--help`

### test

Runs KUTTL tests against a Kubernetes cluster.

For more details see [KUTTL](https://kuttl.dev/)

## version

Show the version of KUDO.

