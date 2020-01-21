# Plans

## Overview

Plans capture the individual steps of operational tasks. A plan organizes these tasks into `phases` and `steps`. Each step references the [tasks](tasks.md) to run for this step. By organizing steps into phases, complex behavior of services can be captured.

Plans and phases have a `strategy`. The `strategy` indicated if `phases` and `steps` should run in parallel or in serial.

```yaml
...
tasks:
  - name: deploy-master
    kind: Apply
    spec:
      resources:
        - master-service.yaml
        - master.yaml
  - name: deploy-agent
    kind: Apply
    spec:
      resources:
        - agent-service.yaml
        - agent.yaml
plans:
  deploy:
    strategy: parallel
    phases:
      - name: deploy-master
        strategy: serial
        steps:
          - name: deploy-master
            tasks:
              - deploy-master
      - name: deploy-agent
        strategy: serial
        steps:
          - name: deploy-agent
            tasks:
              - deploy-agent
```

The KUDO controller deploys the plans of an operator. Only a single plan can be in active deployment at a time. KUDO has  different approaches to decide which plan to deploy.

## Deploy and update plans

By default, KUDO will start the `deploy` plan if no other plan has been deployed yet. In case of an instance update, KUDO will start a `upgrade` or `update` plan if it exists. If none of these plans exist, KUDO will start the `deploy` plan.

In the example below, the `deploy` plan creates a service defined in `service.yaml`. In case of an update, the service's cache needs to be updated. The `update-cache.yaml` provides the necessary resources to do that and thus is part of the `update` plan.

```yaml
...
tasks:
  - name: app
    kind: Apply
    spec:
      resources:
        - service.yaml
  - name: update
    kind: Apply
    spec:
      resources:
        - service.yaml
        - update-cache.yaml
plans:
  deploy:
    strategy: serial
    phases:
      - name: deploy-service
        strategy: serial
        steps:
          - name: deploy
            tasks:
              - app
  update:
    strategy: serial
    phases:
      - name: update-service
        strategy: serial
        steps:
          - name: update
            tasks:
              - update
```

## Cleanup plans

If an optional `cleanup` plan is part of an operator, this plan will run as part of the deletion of an [Instance](../what-is-kudo.md#main-concepts). Once this plan completes or fails, the instance will be deleted.
Operator developers should take care that there aren't any triggers defined for this plan. Furthermore it should be expected that the steps of this plan could fail. E.g., users may want to delete an instance because its `deploy` plan is stuck. In that case resources that the `cleanup` plan tries to remove might not exist on the cluster. The `cleanup` plan will start even if other plans are in progress.

```yaml
...
tasks:
  - name: database
    kind: Apply
    spec:
      resources:
        - database.yaml
  - name: cleanup
    kind: Apply
    spec:
      resources:
        - remove-database.yaml
spec:
  plans:
    deploy:
      strategy: serial
      phases:
        - name: deploy-database
          strategy: serial
          steps:
            - name: deploy
              tasks:
                - database
    cleanup:
      strategy: serial
      phases:
        - name: cleanup-databse
          strategy: serial
          steps:
            - name: cleanup
              tasks:
                - cleanup
```

The `cleanup` plan is implemented using [finalizers](https://kubernetes.io/docs/tasks/access-kubernetes-api/custom-resources/custom-resource-definitions/#finalizers). The instance's `metadata.finalizers` contains the value "kudo.dev.instance.cleanup" while the `cleanup` plan is in progress.

## Parameter triggers

[Parameters](parameters.md) can have optional triggers. A trigger references a plan that will run if the parameter is updated.

The operations required to update a running application can vary depending on which parameter is
being updated. For instance updating the `BROKER_COUNT`, may require a simple update of the deployment, whereas
updating the `APPLICATION_MEMORY` may require rolling out a new version via a canary or blue/green deployment.

```yaml
...
parameters:
- name: REPLICAS
  trigger: deploy
- name: APPLICATION_MEMORY
  trigger: canary
```
