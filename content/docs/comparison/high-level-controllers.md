---
title: vs. High Level Frameworks
type: docs
---

# KUDO vs High Level Frameworks

High Level Frameworks are the area of tools that sit between simple configuration and fully fledged custom controllers.
These tools usually hide the complexities of the Kubernetes internals but allow more control than
simple API operations. As they do not expose all details, they are a little more limited than full custom
controllers, but are easier to develop for if the required use case fits their limitations.

## Metacontroller

Metacontroller is a framework that enables the development of controllers based on web hooks. It makes it easy to
define behavior for custom resources, or to add functionality to existing APIs.

By using web hooks, metacontroller can work with existing tools like jsonnet and other languages, but this
freedom makes it more complex to develop a lifecycle controller. Metacontroller does not provide
an opinionated way for specific use cases, but presents a very generic way to develop controllers.

KUDO is more focused on lifecycle management for applications and interacting with these. By providing an fully
declarative approach tailored to this use case, it makes the development of operators easier.
