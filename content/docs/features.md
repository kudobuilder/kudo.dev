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

## EXPERIMENTAL - Validating admission webhook

In 0.9.0 version of KUDO we introduced a new experimental feature - validating admission webhook. When enabled, it helps to enforce consistency of our CRDs and it also makes sure that the execution plan is atomic and deterministic.

### Why we need this?

Validating [admission webhook](https://kubernetes.io/docs/reference/access-authn-authz/extensible-admission-controllers/) is HTTP callback that receive admission request (from API server) and let you apply validation rules on them. This validation cannot be performed inside controller because that would happen AFTER the resource was stored in ETCD thus leaving us with illegal state already in. Kubernetes admission webhooks require HTTPS to be used for this endpoint.

![Webhook accept](/images/webhook-accept.png?10x20)

![Webhook deny](/images/webhook-deny.png?10x20)

### How to enable validation?

For now, this feature is experimental thus disabled by default. If you want to enable admission webhook on your KUDO installation, you need to run `kudo init --enable-validation` command which installs KUDO into your cluster with admission webhook enabled.

If you already have KUDO installed, you can run `kudo init --enable-validation -o yaml --dry-run` to get the kubernetes resources needed for installation and then apply them to the cluster via `kubectl apply -f`.

Be aware that **KUDO admission webhook has a dependency on cert-manager 0.11 or higher**. You have to have cert-manager installed in your cluster prior to installing the webhook for everything to work.

As a part of the installation KUDO wil:
- expose endpoint over HTTPS in KUDO manager for the webhook
- create ValidatingWebhookConfiguration CRD
- create cert-manager self-signed issuer CRD in the namespace used for KUDO installation
- create cert-manager certificate CRD signed by the issuer in the namespace used for KUDO installation