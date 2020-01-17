---
home: true
heroImage:
heroText:
tagline: The Kubernetes Universal Declarative Operator
actionText: ⇝ Get Started ⇜
actionLink: /docs/
features:
- title: Focus on your software …
  details: The Kubernetes Universal Declarative Operator (KUDO) is a highly productive toolkit for writing Kubernetes Operators.
- title: … not on deploying it to Kubernetes
  details: Using KUDO you can deploy your applications, have the tools needed to operate them, and understand how they're behaving – all without a Ph.D. in Kubernetes.
- title: Automate Day-2 Operations
  details: KUDO lets you configure an Operator’s entire lifecycle using a declarative spec, including things like backup/restore. You don’t have to write Go unless you want to.
footer: Written in Go, maintained by good people.

---

## What is KUDO

* KUDO is a toolkit that makes it easy to build Operators, in most cases just using YAML
* KUDO provides a set of pre-built Operators, that you can just use out of the box or easily customise
* KUDO lets you standardise the way you run Operators


## What are Operators

A stateless web application doesn’t usually need any complex configuration, or actions we need to run during operation. They are either on or off. Although we might have more than one instance running, they aren't coupled together.

A distributed stateful application consists of more than one instance that are tightly connected. They usually need a set of operations to configure and maintain them, which are specific to the application.

Human operators of stateful applications have deep knowledge about how and when to run those operations.

The [Operator pattern](https://https://kubernetes.io/docs/concepts/extend-kubernetes/operator/) is a way of capturing that human knowledge. It provides a way of automating those tasks by extending the native Kubernetes API.

Operators let you perform application tasks like taking backups, rebalancing data, scaling, or changing configuration. Any tasks you might want to do during operation of an application can be automated using an Operator.

## KUDO is for you if...

* You are an application administrator who wants to run your application on Kubernetes, without having to learn about Kubernetes internals
* You are a developer who wants an easy way to write Operators, without having to write thousands of lines of Go
* You run a Kubernetes cluster with many different Operators, and are looking for a way to standardise how you manage your Operators

<div class="flex-container">

::: flex-box
<h3> Get KUDO</h3>

Link to KUDO installation guide
:::

::: flex-box
<h3>Get KUDO Operators</h3>

Link to Operators repo - logos for popular feature-complete Operators like Kafka, Cassandra etc.
Link to runbooks for different applications / operators
:::

</div>

## Join the KUDO Community

[Get started](docs/README.md) with KUDO today, join the [community](community/README.md), and
build your next operator with KUDO!

You can find more talks, tutorials, and events on our [community page](community/README.md#community-content).

KUDO is used by:
* MayaData
* ArangoDB
* Salesforce
* Replicated.com


