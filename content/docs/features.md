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
Operator developers should take care that there aren't any triggers defined for this plan. Furthermore it should be expected that the steps of this plan could fail. E.g., an instance may get deleted because its deploy plan failed. In that case resources that the `cleanup` plan tries to remove might not exist on the cluster. 

```yaml
spec:
  plans:
    deploy:
    ...
    cleanup:
    ...
```
