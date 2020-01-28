---
home: true
navbar: false
heroImage: /images/kudo_horizontal_color@2x.png
heroText:
tagline: The Kubernetes Universal Declarative Operator
actionText: ⇝ Get Started ⇜
actionLink: /docs/
footer: Written in Go, maintained by good people.

---

<div class="flex-container">

::: flex-box
<h4>Focus on your software …</h4>
The Kubernetes Universal Declarative Operator (KUDO) is a highly productive toolkit for writing Kubernetes Operators.
:::

::: flex-box
<h4>… not on deploying to Kubernetes</h4>
Using KUDO you can deploy your applications, have the tools needed to operate them, and understand how they're behaving – all without a Ph.D. in Kubernetes.
:::

::: flex-box
<h4>Automate Day-2 Operations</h4>
KUDO lets you configure an Operator’s entire lifecycle using a declarative spec, including things like backup/restore. You don’t have to write Go unless you want to.
:::

</div>


## What is KUDO?

KUDO is a toolkit that makes it easy to build [Kubernetes Operators](#what-are-operators), in most cases just using YAML.
It provides a set of pre-built Operators, that you can use out of the box or easily customise.
Finally, KUDO lets you standardise the way you run Operators.


## What are Operators?

A stateless web application doesn’t usually need any complex configuration, or actions you need to run during operation. They are either on or off. Although you might have more than one instance running, they aren't coupled together.

A distributed stateful application consists of more than one instance that are tightly connected. They typically need a set of operations to configure and maintain them, and which are specific to the application.

Human operators of stateful applications have deep knowledge about how - and when - to run those operations.

The [Operator pattern](https://https://kubernetes.io/docs/concepts/extend-kubernetes/operator/) is a way of capturing that human knowledge. It provides a means for automating those tasks by extending the native Kubernetes API.

Operators let you perform application tasks like taking backups, rebalancing data, scaling, or changing configuration. Any tasks you might want to do during operation of an application can be automated using an Operator.

## KUDO is for you if...

<div class="flex-container">

::: flex-box
you are an application administrator who wants to run your application on Kubernetes, without having to learn about Kubernetes internals;
:::

::: flex-box
You are a developer who wants an easy way to write Operators, without having to write thousands of lines of Go;
:::

::: flex-box
You run a Kubernetes cluster with many different Operators, and are looking for a way to standardise how you manage your Operators.
:::

</div>

## Get KUDO

<center>

It's easy to get started with KUDO - [follow this handy guide!](/docs/)

</center>

## Get KUDO Operators

<div class="flex-container">

<Button text="Apache Kafka" img="/images/Apache_kafka.svg" url="https://github.com/kudobuilder/operators/tree/master/repository/kafka/docs/latest/" />

<Button text="Apache Cassandra" img="/images/Cassandra_logo.svg" url="https://github.com/kudobuilder/operators/tree/master/repository/cassandra/" />

<Button text="Apache Flink" img="/images/flink_squirrel_500.png" url="https://github.com/kudobuilder/operators/tree/master/repository/flink/" />

</div>

<center>

… and [many more](https://github.com/kudobuilder/operators/)!

</center>

## Join the KUDO Community

[Get started](docs/README.md) with KUDO today, join the [community](community/README.md), and
build your next operator with KUDO!

You can find more talks, tutorials, and events on our [community page](community/README.md#community-content).

KUDO is used by:

<center>

[![D2iQ](/images/d2iq.png =x75)](https://d2iq.com) [![MayaData](/images/mayadata.jpg =200x)](https://mayadata.io) [![Replicated](/images/replicated.png =200x)](https://replicated.com) [![ArangoDB](/images/arangodb.png =200x)](https://arangodb.com)

... and [many others](https://github.com/kudobuilder/kudo/graphs/contributors).

</center>


