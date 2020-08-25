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

## install

## plan

## uninstall

## update

## upgrade

## diagnostics

## Development 

### package

### repo

### test

## version

::: flag kubectl kudo get instances [flags]
Show all available instances.
:::

::: flag kubectl kudo help [command] [flags]
Provides general help or help on a specific command
:::

::: flag kubectl kudo init [flags]
Initialize KUDO on both the client and server
:::

::: flag kubectl kudo install &lt;name&gt; [flags]
Install an operator from the official [kudobuilder/operators](https://github.com/kudobuilder/operators) repository, a URL or local filesystem.
:::

::: flag kubectl kudo package create &lt;operator_folder&gt; [flags]
Packages an operator in a folder into a tgz file.
:::

::: flag kubectl kudo package verify &lt;operator_folder&gt; [flags]
Verifies an operator providing errors and warnings as an output.  Provides a non-zero exit when errors are present.
:::

::: flag kubectl kudo plan status [flags]
View all available plans.
:::

::: flag kubectl kudo plan history &lt;name&gt; [flags]
View all available plans.
:::

::: flag kubectl kudo repo add|context|remove|list
Manages local cache of repository configurations.
:::

::: flag kubectl kudo repo index
Generates an index file given a directory containing KUDO packages.
:::

::: flag kubectl kudo test
Test KUDO and Operators.
:::

::: flag kubectl kudo uninstall
Uninstall operator instances.
:::

::: flag kubectl kudo update
Update installed operator parameters.
:::

::: flag kubectl kudo upgrade
Upgrade installed operator from one version to another.
:::

::: flag kubectl kudo diagnostics
Collect diagnostic data about KUDO and an installed operator instance
::: 

::: flag kubectl kudo version
Print the current KUDO version.
:::
