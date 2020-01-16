# How to Debug KUDO

The KUDO logs are best way to understand what is happening within KUDO.

## Precondition

A cluster with a running instance of KUDO

## Steps

### Get the KUDO Manager Logs

`kubectl logs -n kudo-system kudo-controller-manager-0`


```bash
2020/01/14 13:59:24 PlanExecution: 'everything' step(s) (instance: default/first-operator-instance) of the deploy.main are not ready
2020/01/14 13:59:24 InstanceController: Received Reconcile request for instance "first-operator-instance"
2020/01/14 13:59:24 InstanceController: Going to proceed in execution of active plan deploy on instance default/first-operator-instance
2020/01/14 13:59:24 HealthUtil: Deployment nginx-deployment is NOT healthy. Waiting for deployment spec update to be observed...
2020/01/14 13:59:24 TaskExecution: object default/nginx-deployment is NOT healthy: Waiting for deployment spec update to be observed...
2020/01/14 13:59:24 PlanExecution: 'everything' step(s) (instance: default/first-operator-instance) of the deploy.main are not ready
2020/01/14 13:59:24 InstanceController: Received Reconcile request for instance "first-operator-instance"
2020/01/14 13:59:24 InstanceController: Going to proceed in execution of active plan deploy on instance default/first-operator-instance
2020/01/14 13:59:24 HealthUtil: Deployment nginx-deployment is NOT healthy. Waiting for deployment "nginx-deployment" rollout to finish: 0 out of 2 new replicas have been updated...
2020/01/14 13:59:24 TaskExecution: object default/nginx-deployment is NOT healthy: Waiting for deployment "nginx-deployment" rollout to finish: 0 out of 2 new replicas have been updated...
2020/01/14 13:59:24 PlanExecution: 'everything' step(s) (instance: default/first-operator-instance) of the deploy.main are not ready
2020/01/14 13:59:24 InstanceController: Received Reconcile request for instance "first-operator-instance"
2020/01/14 13:59:24 InstanceController: Going to proceed in execution of active plan deploy on instance default/first-operator-instance
2020/01/14 13:59:24 HealthUtil: Deployment nginx-deployment is NOT healthy. Waiting for deployment "nginx-deployment" rollout to finish: 0 of 2 updated replicas are available...
2020/01/14 13:59:24 TaskExecution: object default/nginx-deployment is NOT healthy: Waiting for deployment "nginx-deployment" rollout to finish: 0 of 2 updated replicas are available...
2020/01/14 13:59:24 PlanExecution: 'everything' step(s) (instance: default/first-operator-instance) of the deploy.main are not ready
2020/01/14 13:59:26 InstanceController: Received Reconcile request for instance "first-operator-instance"
2020/01/14 13:59:26 InstanceController: Going to proceed in execution of active plan deploy on instance default/first-operator-instance
2020/01/14 13:59:26 HealthUtil: Deployment nginx-deployment is NOT healthy. Waiting for deployment "nginx-deployment" rollout to finish: 1 of 2 updated replicas are available...
2020/01/14 13:59:26 TaskExecution: object default/nginx-deployment is NOT healthy: Waiting for deployment "nginx-deployment" rollout to finish: 1 of 2 updated replicas are available...
2020/01/14 13:59:26 PlanExecution: 'everything' step(s) (instance: default/first-operator-instance) of the deploy.main are not ready
2020/01/14 13:59:26 InstanceController: Received Reconcile request for instance "first-operator-instance"
2020/01/14 13:59:26 InstanceController: Going to proceed in execution of active plan deploy on instance default/first-operator-instance
2020/01/14 13:59:26 Deployment nginx-deployment is marked healthy
2020/01/14 13:59:26 PlanExecution: default/first-operator-instance all phases of the plan deploy are ready
2020/01/14 13:59:26 InstanceController: Received Reconcile request for instance "first-operator-instance"
2020/01/14 13:59:26 InstanceController: Nothing to do, no plan in progress for instance default/first-operator-instance
```
