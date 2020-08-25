## Setup the KUDO Kubectl Plugin

### Requirements

- `kubectl` version `1.13.0` or newer

### CLI Installation

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
VERSION=0.12.0
OS=$(uname | tr '[:upper:]' '[:lower:]')
ARCH=$(uname -m)
wget -O kubectl-kudo https://github.com/kudobuilder/kudo/releases/download/v${VERSION}/kubectl-kudo_${VERSION}_${OS}_${ARCH}
chmod +x kubectl-kudo
# add to your path
sudo mv kubectl-kudo /usr/local/bin/kubectl-kudo
```

**note:** On Mac OSX, you may need to explicitly authorize the use of the command.  Details on the [Apple support site](https://support.apple.com/guide/mac-help/open-a-mac-app-from-an-unidentified-developer-mh40616/mac)

### KUDO Initialization



### KUDO Upgrades

### KUDO Uninstall