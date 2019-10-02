# Asserts and Errors

Test asserts are the part of a [test step](steps.md) that define the state to wait for Kubernetes to reach. It is possible to match specific objects by name as well as match any object that matches a defined state. Test errors define states that should not be reached.

<h2>Table of Contents</h2>

[[toc]]

## Format

The test assert file for a test step is found at `$index-assert.yaml`. So, if the test step index is `00`, the assert should be called `00-assert.yaml`. This file can contain any number of objects to match on. If the objects have a namespace set, it will be respected, but if a namespace is not set, then the test harness will look for the objects in the test case's namespace.

The test error file for a test step is found at `$index-errors.yaml` and work similar to the test assert file.

By default, a test step will wait for up to 30 seconds for the defined state to reached, see the [configuration reference](reference.md#testassert) for documentation on configuring test asserts.

Note that an assertion or errors file is optional, if it is not present, the test step will be considered successful immediately, once the objects in the test step have been created. It is also valid to create a test step that does not create any objects, but only has an assertion or errors file.

## Getting a Resource from the Cluster

If an object has a name set, then the harness will look specifically for that object to exist and then verify that its state matches what is defined in the assert file. For example, if the assert file has:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: my-pod
status:
  phase: Successful
```

Then the test harness will wait for the `my-pod` pod in the test namespace to have `status.phase=Successful`. Note that any fields *not* specified in the assert file will be ignored, making it possible to specify only the important fields for the test step.

If this object is in the errors file, the test harness will report an error if that object exists and its state matches what is defined in the errors file.

## Listing Resources in the Cluster

If an object in the assert file has no name set, then the harness will list objects of that kind and expect there to be one that matches. For example, an assert:

```yaml
apiVersion: v1
kind: Pod
status:
  phase: Successful
```

This example would wait for *any* pod to exist in the test namespace with the `status.phase=Successful`.

If this is defined in the errors file instead, the test harness will report an error if *any* pod exists in the test namespace with `status.phase=Successful`.
