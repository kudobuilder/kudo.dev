---
home: true
heroImage: /images/kudo_horizontal_color@2x.png
heroText:
tagline: The Kubernetes Universal Declarative Operator
actionText: ⇝ Get Started ⇜
actionLink: /docs/
features:
- title: Focus on your software …
  details: The Kubernetes Universal Declarative Operator (KUDO) is a highly productive toolkit for writing operators for Kubernetes.
- title: … not deploying it to Kubernetes
  details: Using KUDO, you can deploy your applications, give your users the tools they need to operate it, and understand how it's behaving in their environments – all without a PhD in Kubernetes.
- title: Use declarative templates
  details: KUDO let’s you configure an operator’s lifecycle using a declarative spec. You don’t have to write Go unless you want to.
footer: Written in Go, maintained by good people.

---

::: teaser Featured Content
For a great introduction to KUDO watch the CNCF Webinar series: [Introducing the Kubernetes Universal Declarative Operator](https://www.cncf.io/webinars/introducing-the-kubernetes-universal-declarative-operator/). In order to get an idea about the history of KUDO, a high level comparison between KUDO and Mesos frameworks, listen to the [Kubernetes Podcast #78](https://kubernetespodcast.com/episode/078-kudo/).

You can find more recordings, tutorials, etc on our [community page](community/README.md#community-content). 
:::

# There's more to life than Kubernetes

Software like databases weren't built only to run on Kubernetes. They already have a rich set of tooling for deployment and operations, no matter where they are deployed. These tools are written, tested, and maintained by the experts who know this software best. 

KUDO encourages you to build operators that take advantage of this work.

Instead of re-writing all of these tooling in Go, KUDO allows you to encapsulate your operations into plans. As a operator developer, plans are your route for exposing batteries-included operations for your software. As a user, run plans like backup and restore in confidence that these plans work and are tested. 

# Complicated lifecycle? Keep it simple

Software with complicated lifecycles is the kind of software KUDO optimizes for. In many cases, submitting a bunch of manifests and letting pods crash until other pods have run creates additional complexity in the deployment and maintenance of this software.
 
Init Containers go awry, binaries get wrapped in esoteric launch scripts that are hard to debug, and Kubernetes users have to navigate a minefield of misleading data with poor resolution. The solution? Write software that deploys your software and handles this sequencing for you.

KUDO brings sequencing of complicated software lifecycles without having to build software to do it for you. Plans contain phases, steps, and tasks, allowing plans to represent the full lifecycle of your application's stages.
 
# Just Kubernetes

Other tools require learning a programming language, learning the API, or learning a DSL specific for building operators. For many teams, this doesn't overlap with their core competencies.

Additionally, when a new version of Kubernetes is released, you have to wait for your toolkit to update to take advantage of any new upstream features in Kubernetes.

KUDO operators are just a series of Custom Resource Definitions and Kubernetes templates, with configuration provided by Go Templates. Operators can even inherit from other formats, such as Helm, to quickly be able to re-use these formats and become rapidly productive with KUDO.

[Get started](docs/README.md) with KUDO today, join the [community](community/README.md), and
build your next operator with KUDO!
