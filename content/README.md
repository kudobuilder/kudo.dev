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

<SpecialHeader text="What is KUDO" />

## KUDO:

* Is a toolkit that makes it easy to build Operators, in most cases just using YAML

* Provides a set of pre-built Operators, that you can just use out of the box or easily customise

* Lets you standardise the way you run Operators


<SpecialHeader text="What are Operators" />

A stateless web application doesn’t usually need any complex configuration, or actions we need to run during operation. They are either on or off. Although we might have more than one instance running, they aren't coupled together.

A distributed stateful application consists of more than one instance that are tightly connected. They usually need a set of operations to configure and maintain them, which are specific to the application.

Human operators of stateful applications have deep knowledge about how and when to run those operations.

The [Operator pattern](https://https://kubernetes.io/docs/concepts/extend-kubernetes/operator/) is a way of capturing that human knowledge. It provides a way of automating those tasks by extending the native Kubernetes API.

Operators let you perform application tasks like taking backups, rebalancing data, scaling, or changing configuration. Any tasks you might want to do during operation of an application can be automated using an Operator.

<SpecialHeader text="KUDO is for you if..." />

* You are an application administrator who wants to run your application on Kubernetes, without having to learn about Kubernetes internals
* You are a developer who wants an easy way to write Operators, without having to write thousands of lines of Go
* You run a Kubernetes cluster with many different Operators, and are looking for a way to standardise how you manage your Operators

::: teaser Watch the Intro Video

<EmbeddedVideo url="https://www.youtube.com/embed/j2A8vl0m2hs" />

Or listen to the [Kubernetes Podcast #78](https://kubernetespodcast.com/episode/078-kudo/) to hear about the origin and history of KUDO.

You can find more talks, tutorials, and events on our [community page](community/README.md#community-content).
:::

<SpecialHeader text="User Stories" />

<UserStories />

::: teaser We'd love to hear how you are using KUDO!
Tell us your stories by raising a [Github issue](https://github.com/kudobuilder/www/issues/new?&template=user-story.md&title=Please+add+my+story), and we'll put your logo on the website and send you some exclusive KUDO swag!
:::


<SpecialHeader text="There's more to life than Kubernetes" />

Software like databases weren't built only to run on Kubernetes. They already have a rich set of tooling for deployment and operations, no matter where they are deployed. These tools are written, tested, and maintained by the experts who know this software best. 

KUDO encourages you to build operators that take advantage of this work.

Instead of re-writing all of these tooling in Go, KUDO allows you to encapsulate your operations into plans. As a operator developer, plans are your route for exposing batteries-included operations for your software. As a user, run plans like backup and restore in confidence that these plans work and are tested. 

<SpecialHeader text="Complicated lifecycle? Keep it simple" />

Software with complicated lifecycles is the kind of software KUDO optimizes for. In many cases, submitting a bunch of manifests and letting pods crash until other pods have run creates additional complexity in the deployment and maintenance of this software.

Init Containers go awry, binaries get wrapped in esoteric launch scripts that are hard to debug, and Kubernetes users have to navigate a minefield of misleading data with poor resolution. The solution? Write software that deploys your software and handles this sequencing for you.

KUDO brings sequencing of complicated software lifecycles without having to build software to do it for you. Plans contain phases, steps, and tasks, allowing plans to represent the full lifecycle of your application's stages.

 <SpecialHeader text="Just Kubernetes" />

Other tools require learning a programming language, learning the API, or learning a DSL specific for building operators. For many teams, this doesn't overlap with their core competencies.

Additionally, when a new version of Kubernetes is released, you have to wait for your toolkit to update to take advantage of any new upstream features in Kubernetes.

KUDO operators are just a series of Custom Resource Definitions and Kubernetes templates, with configuration provided by Go Templates. Operators can even inherit from other formats, such as Helm, to quickly be able to re-use these formats and become rapidly productive with KUDO.

[Get started](docs/README.md) with KUDO today, join the [community](community/README.md), and
build your next operator with KUDO!
