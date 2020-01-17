# Features

## Controlled Parameter Changes

### Register Rollout Plan for Parameter

The operations required to safely update a running application can vary depending on which parameter is
being updated. For instance updating the `BROKER_COUNT`, may require a simple update of the deployment, whereas
updating the `APPLICATION_MEMORY` may require rolling out a new version via a canary or blue/green deployment.

Each parameter can be configured with a default update plan via the `deploy` plan that is required by all `OperatorVersions`.

```yaml
...
spec:
  parameters:
  - name: REPLICAS
    update: deploy
  - name: APPLICATION_MEMORY
    update: canary
  plans:
    canary:
    ...
    deploy:
    ...
```

## Cleanup plans

If an optional `cleanup` plan is part of an operator, this plan will run when the operator's instance is being deleted. Once this plan is completed or failed, the instance will be deleted.
Operator developers should take care that there aren't any triggers defined for this plan. Furthermore it should be expected that the steps of this plan could fail. E.g., users may want to delete an instance because its `deploy` plan is stuck. In that case resources that the `cleanup` plan tries to remove might not exist on the cluster. The `cleanup` plan will start even if other plans are currently in progress.

```yaml
spec:
  plans:
    deploy:
    ...
    cleanup:
    ...
```

The `cleanup` plan is implemented using [finalizers](https://kubernetes.io/docs/tasks/access-kubernetes-api/custom-resources/custom-resource-definitions/#finalizers). The instance's `metadata.finalizers` contains the value "kudo.dev.instance.cleanup" while the `cleanup` plan is in progress.
