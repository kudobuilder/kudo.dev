---
title: vs. High Level Frameworks
type: docs
---

# KUDO vs High Level Frameworks
High Level Frameworks are the area of tools that sit between simple configuration and fully fledged custom controllers.
These tools usually hide the complexities of the Kubernetes internals and allow more control than 
simple Kubernetes operations. As they do not expose all details, they don't allow as much possibilities as full 
custom controllers.

## Metacontroller
Metacontroller is a framework that enables the development of controllers based on web hooks. It makes it easy to
define behavior for custom resources, or to add functionality to existing APIs.

By using web hooks in any language, metacontroller covers a wider range of use cases than KUDO. 
But this freedom makes it more complex to develop a lifecycle controller for a specific application than
using KUDO.

KUDO is more focused on lifecycle management for applications and interacting with these. By providing an fully
declarative approach tailored to this use case, it makes the development of operators easier.
