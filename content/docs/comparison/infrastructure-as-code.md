---
title: KUDO vs. IaC
type: docs
---

# KUDO vs Infrastructure as Code

Infrastructure as Code (IAC) tools such as Terraform and Ansible provide powerful benefits when managing infrastructure, deployments, and updates. Developers can use these tools to also manage resources on Kubernetes, enabling management of entire software stacks from base infrastructure components to end deployments.

While Lifecycle management of complex, stateful applications is possible with these tools, they rely on the concept of state convergence. Ansible and Terraform assert that reality converges with a user's declared resources, but this assertion occurs when running their respective CLI tools. These tools do not respond to events from the resources they are responsible for, which potentially leads to drift - both intentional and unintentional - over time. Kubernetes resources change as their underlying infrastructure changes - for example, the scheduler replaces pods when they crash or their hosting node dies. Admission webhooks, other controllers, or users change these resources to interact with other resources in the environment (including service meshes, network policy, and more).

Operators reflect this reality by taking responsibility for the software that they run. They do this in two ways - providing a declarative shell called a Custom Resource Definition (CRD) that creates an API for operator users to define the desired state of their software, as well as a controller that continuously asserts that these resources are always advancing to the desired state.

IaC tools work well in this paradigm. Instead of using Terraform to work with the underlying components that make up a complex software deployment, use Terraform or Ansible to deploy the KUDO controller, and the custom resources that define the operator for the Kubernetes application you want to deploy. This works for any operator, combining the single-view infrastructure convergence power of IaC tooling with the long-term maintenance capabilities of Operators.
