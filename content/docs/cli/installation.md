# Installation

### Requirements

- `kubectl` version `1.13.0` or newer

## CLI Installation

You can either download CLI binaries for linux or MacOS from our [release page](https://github.com/kudobuilder/kudo/releases), or install the CLI plugin using `brew`:

```bash
brew tap kudobuilder/tap
brew install kudo-cli
```

Another alternative is `krew` the package manager for kubectl plugins [doc](https://github.com/kubernetes-sigs/krew)

```bash
kubectl krew install kudo
```

or you can download the CLI binaries from the release page at https://github.com/kudobuilder/kudo/releases/latest and download the release for your platform and OS.  Make executable and add to your path:

```bash
VERSION=x.y.z # look up the current stable release at https://github.com/kudobuilder/kudo/releases/latest
OS=$(uname | tr '[:upper:]' '[:lower:]')
ARCH=$(uname -m)
wget -O kubectl-kudo https://github.com/kudobuilder/kudo/releases/download/v${VERSION}/kubectl-kudo_${VERSION}_${OS}_${ARCH}
chmod +x kubectl-kudo
# add to your path
sudo mv kubectl-kudo /usr/local/bin/kubectl-kudo
```

**note:** On Mac OSX, you may need to explicitly authorize the use of the command.  Details on the [Apple support site](https://support.apple.com/guide/mac-help/open-a-mac-app-from-an-unidentified-developer-mh40616/mac)

## KUDO Initialization

KUDO has an installed component inside the cluster. To install this component, the KUDO CLI provides a command for initialization:

`kubectl kudo init`

This command installs the controller deployment, the webhook and all other components that are required for KUDO to work. The `init` command will abort if it detects an existing KUDO installation - this is to prevent accidental upgrades. For more details on how the KUDO initialization can be customized, see the details on the [init command](commands.md#init)

## KUDO Upgrades

To upgrade an existing KUDO installation, the init process is used as well:

`kubectl kudo init --upgrade`

It is important that you use the same parameters for the upgrade process that you used for the installation; for example if you installed KUDO with:

`kubectl kudo init --namespace kudo-custom --service-account my-kudo-sa`

then you *must* upgrade with

`kubectl kudo init --upgrade --namespace kudo-custom --service-account my-kudo-sa`

This is required for:
- `--namespace`
- `--service-account`
- `--unsafe-self-signed-ca`

otherwise KUDO will fail to correctly detect the existing installation and abort the upgrade.

## KUDO Uninstall

KUDO does not yet have an integrated uninstall command. The most common way for now to uninstall KUDO is:

`kubectl kudo init --upgrade --dry-run --output yaml | kubectl delete -f -`

This will remove all installed KUDO CRDs, deployments and other resources from the cluster

:::warning
This command will delete the KUDO CRDs, which in turn will delete ALL INSTALLED OPERATORS - Make sure you really know what do before you run this!
:::
