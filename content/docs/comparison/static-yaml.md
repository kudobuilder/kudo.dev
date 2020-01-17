---
title: vs. Static Formats
type: docs
---

# KUDO vs Static Definition Formats

A common feature of all Static Definition Formats have, is that they operate from the outside of the cluster.
The more complex tools in this area allow installation, upgrading and rollback of applications, but
don't provide any mechanisms to automatically keep the cluster in the requested state or interact with
the installed applications.

The big benefit of these tools is that they usually don't need an installed component in a cluster, thus
having an easy installation process of the tools itself. Additionally they run with the permissions of the
executing user and don't need any global or administrative rights on the cluster.

Compared to KUDO, the downside of these tools is that they do not control
the state of the application lifecycle. If for example the scale of an application pod is erroneously set to 0,
a controller-based tool will notice this change and scale back to the expected amount, whereas an externally
managed tool will only be able to counteract this change when executed by a user.

 \+ Easy installation of tooling
 \+ No installed component in the cluster
 \+ No requirements for admin permissions on the cluster
 \- Limited control over the installed application
 \- No interaction with installed applications

## Raw YAML

The most easy way to deploy an application. Write and modify Kubernetes YAML files, apply them to the cluster. This works
well for Proof-of-Concepts, very simple applications, or the beginning of the development of a larger application.

\- No parameter replacements
\- No tooling for interacting with deployed applications
\+ No extra software required

## [Kustomize](https://github.com/kubernetes-sigs/kustomize)

Enables the user to patch, merge and modify YAML resources before applying them to a Kubernetes cluster. This allows
simple reusability of resources, but does not provide any ways to meaningfully apply upgrades to an application
or install a complex applications that requires a specific order for installed components.

\- Used for multiple different environments with only slight differences
\- No repository or managed packages

## [Helm](https://helm.sh/)

Helm is a Kubernetes Package Manager. It provides managed packages in a `chart` format, that allows customization,
installation, upgrades and rollback of packages.

Helm v2 uses an installed server (Tiller) in the Cluster to let the client interact with the Kubernetes API server, Helm v3
uses a new architecture that does not depend on this component and works with a client only.

\+ Repository of managed packages
\+ Allows custom repositories for own packages
\+ Provides mechanisms for upgrading packages
\+ Supports templating
\- No further interaction with the installed application
\- No continuous convergence to expected lifecycle state
