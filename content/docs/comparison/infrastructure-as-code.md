---
title: vs. IaC
type: docs
---

# KUDO vs Infrastructure as Code

Infrastructure as Code tools are beneficial for managing applications and cloud infrastructure. Developers can use these tools to manage resources on Kubernetes. This enables users to use one tool for installing and maintaining architecture. Popular tools in this space include Ansible and Terraform, but others exist as well.

These tools often manage resources such as virtual machines and software deployments. A common pattern used in describing these resources is "cattle vs. pets". Cattle refers to components that are easy to replace and where state is not important. This includes web services, APIs, and jobs. Pets refer to components that are difficult to replace or update, including databases. Users must be careful not to lose data when updating or replacing these types of software.

IaC tools often consider the resources running these two types of software to be similar. Stateful applications change over time and drift from how IaC deployed them. Terraform and Ansible only make changes when running them, adding even more risk of drift. Kubernetes resources drift as well. For example, the scheduler replaces pods when they crash or their host dies. Admission webhooks or other controllers change these resources based on cluster requirements.

Operators reflect this reality by taking responsibility for the software that they run. Operators are two combined parts: a custom resource and a controller. The custom resource contains the declarative information for the managed application. Controllers ensure that the resources in the cluster and custom resource match.

IaC tools work well in this paradigm. Instead of using Terraform to work with the underlying components that make up a complex software deployment, use Terraform or Ansible to deploy the KUDO controller, and the custom resources that define the operator for the Kubernetes application you want to deploy. This works for any operator, combining the single-view infrastructure convergence power of IaC tooling with the long-term maintenance capabilities of Operators.

::: warning Terraform Kubernetes Provider Compatibility
In Terraform Kubernetes provider version v1.10.0, Custom Resources and Custom Resource Definitions are in planning but not yet supported. Support for these features is available in a well-maintained [third-party Terraform provider](https://github.com/nabancard/terraform-provider-kubernetes-yaml).
:::
