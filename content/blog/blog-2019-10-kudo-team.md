---
date: 2019-10-30
---

# KUDO, Mesos, and Kubernetes

_In this post, Ken Sipe talks about about the background of how he ended up on the KUDO team, what makes the KUDO team special, and why he believes this team is making a difference in the landscape it's located in._

<!-- more -->

So many changes – where do I begin? I'm making a commitment to blog and share my experience; this is the start. My plan is to:

1) Be informal
2) Cover lots of subjects (Go, containers, orchestration, cloud, k8s, mesos, etc.)
3) Be technical

The start of this journey is to share my excitement for the KUDO project and the great team we have built around it!

## Welcome to KUDO

The TL;DR is that KUDO is a project to simplify operator development on top of Kubernetes. Further details on the [project site](https://kudo.dev/). Don't hesitate to provide feedback, the best way is likely [KUDO slack](https://kubernetes.slack.com/messages/kudo/).

I joined on the project months ago with a first commit on Apr 11, 2019.  My previous focus was on framework development for [Apache Mesos](http://mesos.apache.org/) and [DC/OS](https://dcos.io/) specifically on [Marathon](https://mesosphere.github.io/marathon/) and [Metronome](https://github.com/dcos/metronome). Prior to KUDO, I had years of distributed application development work, working with Docker since version 0.3, Mesos since version 0.13.0. Both of these clearly before Kubernetes was a thought... now look at the landscape. I don't expect that landscape to solidify anytime soon (but predicting the future is a fools errand).

In future blogs, I intend to go into significant details around the technical differences between Mesos and [Kubernetes](https://kubernetes.io), for this blog suffice it to say that Kubernetes won the hearts and minds of developers in providing good solutions for the easier or fundamental features of a distributed container orchestration engine, that being stateless services. While Mesos is a two-level scheduler providing fundamental abstracts but requiring an intelligent scheduler to make decisions (for instance, rescheduling, or repairing), Kubernetes went with a solution around shared state and transactions using lock-free optimistic concurrency control modeled after Googles Omega, more details for [Google research](https://ai.google/research/pubs/pub44843). One characteristic of Kubernetes is its declarative nature which works great for these simpler workloads. As Kubernetes matured and pushed towards more complex container workloads, it requires an intelligent scheduler (dare I say a second scheduler?). In 2016, the term given to this intelligent component was [operator](https://kubernetes.io/docs/concepts/extend-kubernetes/operator/).

The value prop of KUDO is to simplify development of Kubernetes controllers and provide testing and tooling around it.

## KUDO Team

One of the great parts of joining this team is the depth of experience those involved have and how great they are to work with. Several teammates with deep container orchestration experience in the Mesos and DC/OS world. One teammate with deep experience with [helm](https://helm.sh/) and [Deis](https://github.com/deis/deis). There is a ton of rich experience here. These are folks that know everything fails and recovery must be part of the solution. They have years of experience hunting down race conditions and providing well thought out solutions.

This is a very open and friendly team. We are actively working in EU and US timezones. Come join us for a community discussion or throw us a pull-request. Want a feature? Provide a pull-request against a KEP or add an issue. Checkout the [community page](../community) for how to get involved.

## Future insights

While I have a long list of things I'm thinking of blogging I'm open to suggestions. Ping me on twitter below! At this point things to look forward to:

* Difference between Mesos and Kubernetes including:
  * Scheduling
  * Scaling
  * Pod operational differences
* Go insights and challenges:
  * Like 3 libraries for managing YAML
  * Kubernetes: Idiomatic Go it is NOT
* Container landscape

<Authors about="kensipe" />