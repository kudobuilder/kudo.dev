# KUDO New Features: Roundup and Highlights

KUDO's development continues apace, with major new features landing in each release.  This post highlights and summarises a few of the cool new things that have made it in, just in case you missed them being called out in the [release](https://github.com/kudobuilder/kudo/releases) notes.

## Cleanup Plans

An oft-overlooked part of any application deployment lifecycle is what happens as part of termination and deletion.  KUDO 0.9.0 introduced a new type of optional plan, `Cleanup`, which runs when an Instance is being deleted.  The documentation for this new Plan [is here](https://kudo.dev/docs/developing-operators/plans.html#cleanup-plans).

## Pipe Tasks

[Pipe Tasks](https://kudo.dev/docs/developing-operators/tasks.html#pipe-task) landed in version 0.10 and add an additional task type, which can be used to generate content or perform some kind of operational action, the output of which can be re-used in later steps.  This can be useful in situations where, for example, a security certificate needs to be generated in one step, and then referred to and used in subsequent steps.  The [corresponding KEP](https://github.com/kudobuilder/kudo/blob/master/keps/0017-pipe-tasks.md) has more detail on the originally intended use-cases.

## Manual Plan Triggering

The work required to re-implement the ability to manually trigger plans started some time ago, beginning with an [admission webhook](https://github.com/kudobuilder/kudo/blob/master/keps/0018-controller-overhaul.md#admission-webhook) in order to safeguard atomicity of plan executions and prevent conflicting actions.  With the 0.11.0 release and as part of the work on [KEP-20](https://github.com/kudobuilder/kudo/blob/master/keps/0020-manual-plan-execution.md), a new KUDO CLI command was added giving human operators the ability to kick off a specific plan.  Note that KUDO must be deployed with the InstanceValidation webhook enabled, and that in turn currently has a dependency on cert-manager.  However, once configured it means that specific plans can be invoked with the `plan trigger` subcommand:

```shell
nick@zaphod:..sitory/mysql/operator> kubectl kudo plan trigger --instance=mysql --name=backup
Triggered backup plan for default/mysql instance
nick@zaphod:..sitory/mysql/operator> kubectl kudo plan status --instance=mysql | grep backup    
└── mysql (Operator-Version: "mysql-0.3.0" Active-Plan: "backup")
    ├── Plan backup (serial strategy) [COMPLETE], last updated 2020-04-16 10:09:29
    │   └── Phase backup (serial strategy) [COMPLETE]
    │       ├── Step backup [COMPLETE]
```

## New commands to query Operators

A slew of updates in 0.9.0 and 0.10.0 were related to improving the Operator developer experience.  These included dedicated `package` KUDO CLI subcommands for various actions:

### Understanding Operator Details

As Operator's complexity grows, it becomes important for a human operator or application administrator to be able to understand internal details such as what Plans are defined and what Parameters are available.  The `package list` KUDO CLI command is aimed at solving this, and can summarise some of these internals - specifically those related to tasks, plans, and parameters:

```shell
$ kubectl kudo package list plans kafka
plans
├── deploy (serial)
│   └── [phase]  deploy-kafka (serial)
│       └── [step]  deploy
│           └── deploy
├── mirrormaker (serial)
│   └── [phase]  deploy-mirror-maker (serial)
│       └── [step]  deploy
│           └── mirrormaker
└── not-allowed (serial)
    └── [phase]  not-allowed (serial)
        └── [step]  not-allowed
            └── not-allowed

$ kubectl kudo package list parameters kafka | grep -i zookeeper
KERBEROS_ENABLED_FOR_ZOOKEEPER     	false                              	true    
ZOOKEEPER_PATH                     	                                   	false   
ZOOKEEPER_SESSION_TIMEOUT_MS       	6000                               	true    
ZOOKEEPER_SYNC_TIME_MS             	2000                               	true    
ZOOKEEPER_URI                      	zookeeper-instance-zookeeper-0.z...	true    
```

### Skeleton Generators

Another feature added to help simplify and streamline the development of KUDO Operators is that of Skeleton Generators.  The `package new` subcommand can be used to create a new Operator and ensures that the right folder structure is in place along with an empty `operator.yaml` and `params.yaml`.  There's also an interactive mode which will prompt for basic information:

```shell
$ kubectl kudo package new mystatefulapp
nick@zaphod:~/tmp/myapp> tree .
.
└── operator
    ├── operator.yaml
    └── params.yaml

1 directory, 2 files
$ cat operator/operator.yaml
cat operator/operator.yaml 
apiVersion: kudo.dev/v1beta1
kudoVersion: 0.11.1
name: mystatefulapp
operatorVersion: 0.1.0
plans: {}
tasks: []
```

### Package Verify

Finally, `package verify` can be used when developing a KUDO Operator to help identify unused parameters and other potential problems:

```shell
nick@zaphod:../operators/repository> git diff
diff --git a/repository/mysql/operator/params.yaml b/repository/mysql/operator/params.yaml
index 4227b78..95610e5 100644
--- a/repository/mysql/operator/params.yaml
+++ b/repository/mysql/operator/params.yaml
@@ -14,3 +14,6 @@ parameters:
   - name: STORAGE
     default: 1Gi
     description: "Size of volume to store MySQL data"
+  - name: PORT
+    default: 3306
+    description: "Default port for MySQL"

nick@zaphod:../operators/repository> kubectl kudo package verify mysql/operator
Warnings                              
parameter "PORT" defined but not used.
package is valid
```

Read more about these new `package` subcommands command in [the docs](https://kudo.dev/docs/cli.html#commands).

## Toggle Tasks

[KEP-23](https://github.com/kudobuilder/kudo/blob/master/keps/0023-enable-disable-features.md) proposed a new Task type, 'Toggle'.  As KUDO Operator developers add more features to their Operator implementations, this task type lets users easily enable or disable features in their application deployment by setting or unsetting a particular parameter.  This feature landed in KUDO v0.11.0, and an example of its use can be seen in the [Kafka Operator](https://github.com/kudobuilder/operators/blob/66532778f7d5467f080809d09b25880fde016f28/repository/kafka/operator/operator.yaml#L41).

<Authors about="yankcrime" />
