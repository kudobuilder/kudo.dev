
## Commands

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
