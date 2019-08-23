# Events

Events are [rendered](../community/events.md) via the `EventsIndex` [component](https://github.com/kudobuilder/www/blob/master/content/.vuepress/components/EventsIndex.vue) from simple markdown pages located in the [events folder](https://github.com/kudobuilder/www/tree/master/content/community/events). The format is as follows:

```markdown
<!-- kubernetes-edinburgh-2019-07.md -->
---
event: Kubernetes Edinburgh
topic: KUDO - Kubernetes Operators, the easy way
speaker: Matt Jarvis
date: 2019-07-30
location: Edinburgh, Scotland
url: https://www.meetup.com/Kubernetes-Edinburgh/events/263060075/
---

Any markdown above the `more` comment is rendered as an excerpt on the events page.
Please don't use headers here.

<!-- more -->
```

Events will be ordered by date with the next upcoming events naturally listed first.

## Properties

All fields provided in the example should be self-explanatory. If you don't have a URL yet, leave it empty; no URL will be rendered in this case.

::: flag event
The event under which this session is hosted; usually the name of the user group, meetup, or similar (e.g. _Cloud Native Bulgaria_)
:::

::: flag topic
The topic of this event; usually whatever the speaker(s) will talk about
:::

::: flag speaker
The speaker, or multiple, just make a comma separated list.
:::

::: flag date
The date of the event in format `YYYY-MM-DD`.
:::

::: flag location
The location in format `<City, Country>`
:::

::: flag url
(optional) A URL providing more information (e.g. the meetup event URL). If you don't know the URL yet, leave it empty.
:::

::: flag excerpt
An excerpt will be rendered if any markdown content precedes an html comment `more`:
```markdown
<!-- more -->
```
An excerpt will only be rendered, if such comment exists. Please do not use headers in this section.
:::

## Naming Convention

Events will be sorted according to their date, but when searching for a specific one to edit, you'll likely have the **event** in mind, not so much the date. In order to easily find a file in a growing list, please name them according to this naming convention: `<event>-<YYYY-MM>.md`. Add dashes for readability, for example `kubernetes-edinburgh-2019-07.md`.

## Component Properties

::: flag subset
(default: `upcoming`) The subset of events that shall be rendered in this instance of the component. Specifying anything else than `upcoming` will render only past events. The ordering of displayed events is as follows:
* `upcoming` events are ordered by date, ascending
* `past` events are ordered by date, descending; i.e., the most recent event will be on top.
:::
