# CLI Usage

This document demonstrates how to use the CLI but also shows what happens in KUDO under the hood, which can be helpful when troubleshooting.

<h2>Table of Contents</h2>

[[toc]]

## Setup the KUDO Kubectl Plugin

### Requirements

- `kubectl` version `1.13.0` or newer
- KUDO CRDs installed to your cluster and KUDO controller is running. See the [getting started guide](README.md) for instructions
- `kubectl kudo` is running outside your cluster

### Installation

You can either download CLI binaries for linux or MacOS from our [release page](https://github.com/kudobuilder/kudo/releases), or install the CLI plugin using `brew`:

```bash
brew tap kudobuilder/tap
brew install kudo-cli
```

or you can compile and install the plugin from your `$GOPATH/src/github.com/kudobuilder/kudo` root folder via:

```bash
make cli-install
```

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

::: flag kubectl kudo package &lt;operator_folder&gt; [flags]
Packages an operator in a folder into a tgz file.
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

::: flag kubectl kudo version
Print the current KUDO package version.
:::

## Flags

::: tip Usage
`kubectl kudo install <name> [flags]`
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

::: flag --package-version (string)
A specific package version on the official GitHub repo. (default to the most recent)
:::

::: flag -p, --parameter (stringArray)
The parameter name and value separated by '='
:::

::: flag --repo (string)
The name of the repository in the `repo list` configuration to use. (default to configured repository context)
:::


## Examples

### KUDO Init

KUDO itself is a Kubernetes operator. As such it requires the installation of CRDs and the deployment of KUDO, in addition to the establishment of certain prerequisites like creating the namespace to install in. All of this can be handled by the KUDO CLI. To accomplish this, run `kubectl kudo init`.  Some variations on this might include:

* `kubectl kudo init --wait --wait-timeout 600` which will install CRDS, install KUDO and will wait up to 600 seconds for KUDO to be responsive.
* `kubectl kudo init --dry-run --output=yaml > kudo-install.yaml` which will not install anything but will output YAML to a file which can be applied manually to the server.
* `kubectl kudo init --version=0.5.0` which will install the `0.5.0` into the cluster using the image `kudobuilder/controller:v0.5.0`
* `kubectl kudo init --kudo-image=mycompany/controller:v0.6.0` allowing for user certified images or air-gapped alternative images to be installed.
* `kubectl kudo init --client-only` which will not apply any changes to the cluster. It will setup the default KUDO home with repository options.
* `kubectl kudo init --crd-only` will create crds in the cluster.

**Note**: Looking to delete kubernetes objects created via init, run:

* `kubectl kudo init --dry-run -o yaml | kubectl delete -f -` which will delete all kubernetes objects created with init or
* `kubectl kudo init --dry-run -o yaml --crd-only | kubectl delete -f -` which will only delete the KUDO CRDs.

**Note**: If you want to ensure all components are installed, just init again. It will cycle through all objects and ensure they are created.

### Install a Package

There are four options how to install a package. For development you can install packages from your local filesystem or local tgz file.
For testing, or working without a repository, it is possible to install from a URL. Another option is to install from the package repository.

Installation during development can use a relative or absolute path to the package folder.
```bash
kubectl kudo install pkg/kudoctl/bundle/testdata/zk
```

To support the installation of operators not yet in the repository, it is possible to install directly from a URL.
```bash
kubectl kudo install http://kudo.dev/zk.tgz
```

For normal operations it is recommended to use the official packages provided through the [kudobuilder/operators](https://github.com/kudobuilder/operators) repository.
To install official Kafka package you have to do the following:

```bash
kubectl kudo install kafka
```

Both of these options will install new instance of that operator into your cluster. By default, the instance name will be generated.

### Install a Package Overriding Instance Name and Parameters

Use `--instance` and `--parameter`/`-p` for setting an instance name and parameters, respectively:

```bash
$ kubectl kudo install kafka --instance=my-kafka-name --parameter ZOOKEEPER_URI=zk-zk-0.zk-hs:2181,zk-zk-1.zk-hs:2181,zk-zk-2.zk-hs:2181 --parameter ZOOKEEPER_PATH=/small -p BROKERS_COUNTER=3
operator.kudo.dev/kafka unchanged
operatorversion.kudo.dev/kafka unchanged
No instance named 'my-kafka-name' tied to this "kafka" version has been found. Do you want to create one? (Yes/no)
instance.kudo.dev/v1alpha1/my-kafka-name created
$ kubectl get instances
NAME            AGE
my-kafka-name   6s
```


### Get Instances

You can use the `get` command to get a list of all current instances:

```bash
kubectl kudo get instances --namespace=<default> --kubeconfig=<$HOME/.kube/config>
```

Example:

```bash
$ kubectl kudo get instances
  List of current instances in namespace "default":
  .
  ├── small
  ├── up
  └── zk
```

This maps to the `kubectl` command:

`kubectl get instances`

Example:

```bash
$ kubectl kudo get instances
  NAME      CREATED AT
  small     4d
  up        3d
  zk        4d
```

### Get the Status of an Instance

Now that you have a list of available instances, you can get the current status of all plans for one of them:

`kubectl kudo plan status --instance=<instanceName> --kubeconfig=<$HOME/.kube/config>`

**Note**: The `--instance` flag is mandatory.

```bash
$ kubectl kudo plan status --instance=up
  Plan(s) for "up" in namespace "default":
  .
  └── up (Operator-Version: "upgrade-v1" Active-Plan: "up-deploy-493146000")
      ├── Plan deploy (serial strategy) [COMPLETE]
      │   └── Phase par (serial strategy) [COMPLETE]
      │       └── Step run-step (COMPLETE)
      ├── Plan update (serial strategy) [NOT ACTIVE]
      │   └── Phase par (serial strategy) [NOT ACTIVE]
      │       └── Step par (serial strategy) [NOT ACTIVE]
      │           └── run-step [NOT ACTIVE]
      └── Plan upgrade (serial strategy) [NOT ACTIVE]
          └── Phase par (serial strategy) [NOT ACTIVE]
              └── Step par (serial strategy) [NOT ACTIVE]
                  └── run-step [NOT ACTIVE]
```

In this tree chart you see all important information in one screen:

* `up` is the instance you specified.
* `default` is the namespace you are in.
* `upgrade-v1` is the instance's **Operator-Version**.
* `up-deploy-493146000` is the current **Active-Plan**.
    + `par` is a serial phase within the `deploy` plan which is `COMPLETE`.
    + `deploy` is a `serial` plan which is `COMPLETE`.
    + `run-step` is a `serial` step which is `COMPLETE`.
* `update` is another `serial` plan that is currently `NOT ACTIVE`.
    + `par` is a serial phase within the `update` plan which is `NOT ACTIVE`.
    + `par` is a `serial` collection of steps which is `NOT ACTIVE`.
    + `run-step` is a `serial` step within the `par` step collection which is `NOT ACTIVE`.
* `upgrade` is another `serial` plan which is currently `NOT ACTIVE`.
    + `par` is a serial phase within the `upgrade` plan which is `NOT ACTIVE`
    + `par` is a `serial` collection of steps which is `NOT ACTIVE`.
    + `run-step` is a `serial` step within the `par` step collection which is `NOT ACTIVE`.

For comparison, the according `kubectl` commands to retrieve the above information are:

* `kubectl get instances` (to get the matching `OperatorVersion`)
* `kubectl describe operatorversion upgrade-v1` (to get the current `PlanExecution`)
* `kubectl describe planexecution up-deploy-493146000` (to get the status of the `Active-Plan`)

Here, you can find the overview of all available plans in `Spec.Plans` of the matching `OperatorVersion`:

```bash
$ kubectl describe operatorversion upgrade-v1
Name:         upgrade-v1
Namespace:    default
Labels:       controller-tools.k8s.io=1.0
Annotations:  kubectl.kubernetes.io/last-applied-configuration={"apiVersion":"kudo.dev/v1alpha1","kind":"OperatorVersion","metadata":{"annotations":{},"labels":{"controller-tools.k8s.io":"1.0"},"name":"upgra...
API Version:  kudo.dev/v1alpha1
Kind:         OperatorVersion
Metadata:
  Cluster Name:
  Creation Timestamp:  2018-12-14T19:26:44Z
  Generation:          1
  Resource Version:    63769
  Self Link:           /apis/kudo.dev/v1alpha1/namespaces/default/operatorversions/upgrade-v1
  UID:                 30fe6209-ffd6-11e8-abd5-080027d506c7
Spec:
  Connection String:
  Operator:
    Kind:  Operator
    Name:  upgrade
  Parameters:
    Default:       15
    Description:   how long to have the container sleep for before returning
    Display Name:  Sleep Time
    Name:          SLEEP
    Required:      false
  Plans:
    Deploy:
      Phases:
        Name:  par
        Steps:
          Name:  run-step
          Tasks:
            run
        Strategy:  serial
      Strategy:    serial
    Update:
      Phases:
        Name:  par
        Steps:
          Name:  run-step
          Tasks:
            run
        Strategy:  serial
      Strategy:    serial
    Upgrade:
      Phases:
        Name:  par
        Steps:
          Name:  run-step
          Tasks:
            run
        Strategy:  serial
      Strategy:    serial
  Tasks:
    Run:
      Resources:
        job.yaml
  Templates:
    Job . Yaml:  apiVersion: batch/v1
kind: Job
metadata:
  namespace: default
  name: {{PLAN_NAME}}-job
spec:
  template:
    metadata:
      name: {{PLAN_NAME}}-job
    spec:
      restartPolicy: OnFailure
      containers:
      - name: bb
        image: busybox:latest
        imagePullPolicy: IfNotPresent
        command:
        - /bin/sh
        - -c
        - "echo {{PLAN_NAME}} for v1 && echo Going to sleep for {{SLEEP}} seconds && sleep {{SLEEP}}"

  Version:  1.0.0
Events:     <none>
```

You can then find the status of the currently applied plan when looking at the particular `PlanExecution`:

```bash
$ kubectl describe planexecution up-deploy-493146000
  Name:         up-deploy-493146000
  Namespace:    default
  Labels:       operator-version=upgrade-v1
                instance=up
  Annotations:  <none>
  API Version:  kudo.dev/v1alpha1
  Kind:         PlanExecution
  Metadata:
    Cluster Name:
    Creation Timestamp:  2018-12-14T19:26:44Z
    Generation:          1
    Owner References:
      API Version:           kudo.dev/v1alpha1
      Block Owner Deletion:  true
      Controller:            true
      Kind:                  Instance
      Name:                  up
      UID:                   3101bbe5-ffd6-11e8-abd5-080027d506c7
    Resource Version:        63815
    Self Link:               /apis/kudo.dev/v1alpha1/namespaces/default/planexecutions/up-deploy-493146000
    UID:                     31037dd0-ffd6-11e8-abd5-080027d506c7
  Spec:
    Instance:
      Kind:       Instance
      Name:       up
      Namespace:  default
    Plan Name:    deploy
  Status:
    Name:  deploy
    Phases:
      Name:   par
      State:  COMPLETE
      Steps:
        Name:    run-step
        State:   COMPLETE
      Strategy:  serial
    State:       COMPLETE
    Strategy:    serial
  Events:        <none>
```

Finally, the status information for the `Active-Plan` is nested in this part:

```bash
  Status:
    Name:  deploy
    Phases:
      Name:   par
      State:  COMPLETE
      Steps:
        Name:    run-step
        State:   COMPLETE
      Strategy:  serial
    State:       COMPLETE
    Strategy:    serial
```

Apparently, KUDO's tree view makes this information easier to understand and prevents you from putting together the bits and pieces of various commands.

### Delete an Instance

You can delete an instance (i.e. uninstall it from the cluster) using `kubectl kudo uninstall --instance <instanceName>`. The deletion of an instance triggers the removal of all the objects owned by it.

### Get the History to PlanExecutions

This is helpful if you want to find out which plan ran on your instance to a particular `OperatorVersion`.
Run this command to retrieve all plans that ran for the instance `up` and its OperatorVersion `upgrade-v1`:

```bash
$ kubectl kudo plan history upgrade-v1 --instance=up
  History of plan-executions for "up" in namespace "default" to operator-version "upgrade-v1":
  .
  └── up-deploy-493146000 (created 4h56m12s ago)
```

Run this command to retrieve the history of all plans applied to an instance:

```bash
$ kubectl kudo plan history --instance=up
  History of all plan-executions for "up" in namespace "default":
  .
  └── up-deploy-493146000 (created 4h52m34s ago)
```

This includes the previous history but also all OperatorVersions that have been applied to the selected instance.

### Package an Operator

You can use the `package` command to package an operator into a tarball. The package name will be determined by the operator metadata in the package files. The folder of the operator is passed as an argument. It is possible to pass a `--destination` location to build the tgz file into.

`kubectl kudo package zookeeper --destination=target`

Example:

```bash
$ kubectl kudo package ../operators/repository/zookeeper/operator/ --destination=~
  Package created: /Users/kensipe/zookeeper-0.1.0.tgz
```

### Creating a Repository Index File

A repository is a set of operator packages (tarballs) which are indexed in an index file. To create an index file, execute `kubectl kudo repo index operators` where `operators` is a folder container operator package files.  

```bash
# example folder
ls ~/repo
kafka-0.1.2.tgz		kafka-0.2.0.tgz

# repo index
kubectl kudo repo index ~/repo
index /Users/kensipe/repo/index.yaml created.

cat ~/repo/index.yaml
apiVersion: v1
entries:
  kafka:
  - digest: f81ffdad2caea40c8fc19c676b1e51b598d1472de5563c0ae8308e649c8ea159
    maintainers:
    - name: Zain Malik <zmalikshxil@gmail.com>
    name: kafka
    urls:
    - http://localhost/kafka-0.2.0.tgz
    version: 0.2.0
  - appVersion: 2.2.1
    digest: fbff9679cd0070bf10dcafc8d5e1e7d13a5c1651154165162c543508895a37c0
    maintainers:
    - name: Zain Malik <zmalikshxil@gmail.com>
    name: kafka
    urls:
    - http://localhost/kafka-0.1.2.tgz
    version: 0.1.2
```

It can be useful when overwriting a file to use `--overwrite`.  It is also useful to use `--url=http://kudo.dev/repo` to supply the desired URL the operator packages will be hosted on.

### Managing Repositories

After KUDO has initialized a client, `kubectl kudo init` or `kubectl kudo init --client-only`, it is possible to configure other repositories. Let's start with a `repo list` using:

```
kubectl kudo repo list
NAME      	URL                                           
*community	https://kudo-repository.storage.googleapis.com
```
The default installation shown shows one repository configured with the name "community".  The `*` indicates that this is the default repository to use (unless the flag `--repo=xyz` is used).  This is considered the current context.

When a repository is added using `kudo add ...`, the url provided will be used to access the index.yaml file which will be validated.  If the url is not reachable or the index file is corrupt the repository entry will fail to be added.  It is possible to skip this check with the `--skip-check` flag.  You can add a repository in the following way.  `kubectl kudo repo add local http://localhost --skip-check`. Resulting in:

```
kubectl kudo repo list
NAME      	URL                                           
*community	https://kudo-repository.storage.googleapis.com
local       	http://localhost
```

In order to set the local repository as the current context execute: `kubectl kudo repo context local`, resulting in:
```
kubectl kudo repo list
NAME      	URL                                           
community	https://kudo-repository.storage.googleapis.com
*local       	http://localhost
```
Now all installs and upgrades will default to the local repository.

In order to remove a repository simply run `kubectl kudo repo remove foo`


### Update Parameters on Running Operator Instance

Every operator can define overridable parameters in `params.yaml`. When installing an operator and deploying an instance, you can use the defaults or override them with `-p` parameters to `kudo install`.

The `kudo update` command allows you to change these parameters even on an already running operator instance. For example, if you have an instance in your cluster named `dev-flink` (you can figure out what you have installed with `kubectl get instances`) and that operator exposes a parameter with the name `param`, you can change its value with the following command:

`kubectl kudo update --instance dev-flink -p param=value`

### Upgrade Running Operator from One Version to Another

Following the same example from the previous section, having a `dev-flink` instance installed, we can upgrade it to a newer version with the following command:

`kubectl kudo upgrade flink --instance dev-flink -p param=xxx`

A new version of that operator is installed to the cluster and `upgrade` (or `deploy`) plan is started to roll out new Flink pods.

At the same time, we're overriding the value of the parameter `param`. That is optional and you can always do it in a separate step via `kudo update`.
