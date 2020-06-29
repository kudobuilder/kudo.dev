---
date: 2020-06-29
---

# KUTTL v0.5.0 Released

Today we release KUTTL v0.5.0.  Most releases are simply announced, however this v0.5.0 release is so jam packed that it warrents a blog post to help those using kuttl to come up to speed on the latest features.  This post will outline the **highlights** of the v0.5.0 release which includes:

* Assert and Errors Command
* Namespace Control
* Command Expansion with commands, and TestStep annotations
* Pod Log Collector 
* Test Reports

<!-- more -->

## Assert and Errors Commands

Added to the KUTTL set of commands is `assert` and `errors`.  The premise behind these commands is while you are writing a new kuttl test, it is common to manually adjust or query the cluster for information as you form the assert or errors files.  It is super helpful to "check" an assert file against the current state of the cluster without the need to walk through the entire test steps for that test.  It could also be useful to assert a cluster to be ready for testing a set of tests. 

As an example, perhaps you have a pod running and you want to confirm it is running.  A common kuttl parital yaml file might looking like (01-assert.yaml):

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: static-web
status:
  phase: Running
```

Running a `kubectl kuttl assert --timeout 5 01-assert.yaml` might provide an successful response such as:
`"01-assert.yaml" in "default" namespace is valid`
or it may provide a verbose output which ends with the details such as:

`resource Pod:default/static-web: .status.phase: value mismatch, expected: Running != actual: Pending`

::: warning
These examples expect that you have a running kubernetes cluster and that kuttl can connect to it.
:::

The `errors` command provides the absolute affect, it asserts that the value doe NOT exist in the cluster. Example:
```
kubectl kuttl errors --timeout 5 01-assert.yaml
error assert is valid
```

::: tip
These commands work with URLs as well.  Example: `kubectl kuttl errors https://gist.githubusercontent.com/kensipe/ccf11977a1f9816865beae1a6e4e7883/raw/df0f0432387486410b5a3da20b5d45fead9e91b0/assert.yaml --timeout 1
error assert is valid`
:::


## Namespace Control

Previous to v0.5.0 KUTTL would always create a test namespace.  This works great in environments where you have full control of your cluster, however many orgs were unable to use kuttl for this reason allow.  It is now possible to pass a namespace to kuttl to use.  When a namespace is provided, kuttl will use that namespace if it exists and attempts to create if it doesn't.  The justification for creation is the test suite would have failed if the namespace didn't exist, if the kuttl user isn't authorized to create a namespace it will also fail. 

:::warning
When a namespace is NOT provided to KUTTL, it will create namespace for each test in the testsuite providing some test isolation.  When a namespace is provided, that namespace is used for all tests in the test suite.
:::

:::warning 
KUTTL deletes namespaces which it creates.  If the namespace was NOT created by KUTTL it does not delete it.
:::

An example run is: `kubectl kuttl test ~/projects/playground/e2e/ -n default` which will runs under the default namespace.

## Command Expansion

Prior to v0.5.0, KUTTL provided command expanstion of ENV VARs in commands for `TestStep`.  This allowed for a command that used `$NAMESPACE` in the command.  This lead to requests for use in other areas... In particular newly added features for `TestStep` using `apply`, `errors` and `assert`.  The following is now possible:

```
apiVersion: kuttl.dev/v1beta1
kind: TestStep
timeout: 30
apply:
  - ${TEST_FOO}/test.yaml
assert:
  - $TEST_FOO/test.yaml
```

This does require that `$TEST_FOO` is defined.

:::warning
It is worth noting regarding the expansion of `commands` that it doesn't have full shell support and is limited.  There is a new command option `script` which runs the command in a shell, which provides more shell ability.  Example:

```
commands:
    - command: ls -l
    - script: for i in {1..5}; do echo $NAMESPACE; done
```
:::

## Pod Log Collector

There was a command request to support when a test assert fails to gather more information from the cluster.  A popular request was to enable the ability to get pod logs.   That is now possible!  It is configured with `TestAssert` and provides a way to collect the logs from a pod which will be redirected into the test logs.  

When configuring a pod, you can select on name or label.  You can also explicit specify the container.

```
apiVersion: kuttl.dev/v1beta1
kind: TestAssert
collectors:
  - selector: app=nginx
```

This configuration will select on a label of `app` with a value of `nginx` and will grab the log output, which is the output from `kubectl logs <pod>`.  It is important to note, that this log output is ONLY captured when an assert or errors failure occurs.  If the tests pass, no log is captured.

## Test Reports

We've added the abiliy to ask kuttl to provide a test suite report.  Currently, by default, no report is generated.  While kuttl uses `go test` under the hood, the output of kuttl is different enough that `jstemmer/go-junit-report` doesn't work as one would hope.  Based on the need for reports, we provide 2 types:  JSON or XML.  They are the same reports in 2 different formats.  Whe XML report is JUnit report compliant and works with most CI environments.  The default location for the report is the current working directory which you are running kuttl from. It is possible to override that with the `--artifacts-dir`.

The XML output for the e2e tests in kuttl project can be generated in the following way: `kubectl kuttl test pkg/test/test_data/ --timeout 10 --report xml` and produces the following:

```
<testsuites name="" tests="10" failures="1" time="16.655560703s">
   <testsuite tests="10" failures="1" time="11.770504224s" name="pkg/test/test_data/">
     <testcase classname="test_data" name="list-pods" time="67.649654ms" assertions="1"></testcase>
     <testcase classname="test_data" name="teststep-assert" time="182.35219ms" assertions="2"></testcase>
     <testcase classname="test_data" name="teststep-errors" time="217.915925ms" assertions="4"></testcase>
     <testcase classname="test_data" name="teststep-apply" time="292.566614ms" assertions="2"></testcase>
     <testcase classname="test_data" name="delete-in-step" time="681.225526ms" assertions="4"></testcase>
     <testcase classname="test_data" name="create-or-update" time="844.747083ms" assertions="7"></testcase>
     <testcase classname="test_data" name="with-overrides" time="1.138570835s" assertions="4"></testcase>
     <testcase classname="test_data" name="crd-in-step" time="1.781726862s" assertions="2"></testcase>
     <testcase classname="test_data" name="deprecate-test" time="1.799839758s" assertions="2"></testcase>
     <testcase classname="test_data" name="cli-test" time="11.769091322s" assertions="2">
       <failure message="failed in step 1-patch" type="">resource Pod:kudo-test-suited-tomcat/cli-test-pod: .metadata.labels.test: value mismatch, expected: false != actual: true</failure>
     </testcase>
   </testsuite>
 </testsuites>
```

## Summary

The above are just the highlights.  There more to the kuttl v0.5.0 release like better cleanup from a SIGTERM or CTRL+C break.  Have a look... keep testing and keep kuttl-ing1


<Authors about="kensipe" />