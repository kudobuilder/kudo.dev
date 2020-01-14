---
title: vs. Custom Controllers
type: docs
---

# KUDO vs Custom Controllers
Writing custom controllers is the process of writing code to manage the lifecycle of an application.
It requires the most effort but allows the most freedom for very special requirements.
This approach is best used for operators of applications that need very specific features which KUDO does not provide.

Developing a custom operator requires a lot of intimate knowledge of kubernetes and is usually not required
for lifecycle management of most applications. Apart from the specific requirements of the application lifecycle, it
also burdens the developer to manage the operator, including testing, upgrades to the kubernetes cluster, changes to the
stored data of the operator and changing APIs.

KUDO allows a an application developer to create an operator with declarative measures. Without custom Go code, 
KUDO operators provide most of the functionality of a custom operator.

\+ Full control over the cluster and deployed resources  
\+ Allows reaction to changes in the cluster, custom resources, validation  
\+ Allows any required behaviour  
\- Requires intimate knowledge of kubernetes internals  
\- Is an extra software to develop, test and manage

## [Kubernetes Clients](https://kubernetes.io/docs/reference/using-api/client-libraries/)
The most freedom while developing a controller is to use the available kubernetes clients, either in Go, Java, 
JS/Typescript or other languages. These clients provide a direct and low level access to the kubernetes APIs, 
without any wrapper or additional layer.

This allows the usage of any language and doesn't force any opinion onto the developers. But it 
requires the developers to solve a lot of known problems and does not provide guidance for specific common 
topics in the kubernetes space.

## [Kubebuilder](https://github.com/kubernetes-sigs/kubebuilder)
Kubebuilder is a framework for building Kubernetes APIs using CRDs. It uses Go, and provides an opinionated way
to generate and develop Kubernetes APIs. It utilizes the [controller-runtime](https://github.com/kubernetes-sigs/controller-runtime)
library as a base for new controllers.

When following the Kubebuilder approach, Data is stored in CustomResourceDefinitions. A Controller then implements 
reconcile loops that watches the CRs and other resources and handles changes according to the business logic.

Kubebuilder provides good documentation and examples. This allows the development of a custom operator from the 
ground up and with a clear path through common problems.

## [Operator SDK](https://github.com/operator-framework/operator-sdk)
The Operator SDK provides even more scaffolding and higher level frameworks around controller-runtime. It allows
integration with Helm or Ansible, and has a large feature set. 

