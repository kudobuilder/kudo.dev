# Events

Events are [rendered](../community/events.md) from simple markdown pages via the `EventsIndex` component with only a few things you need to know:

```markdown
<!-- event.md -->
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

Posts will be ordered by date with the more recent posts naturally listed first.

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
(optional) A URL providing more information (e.g. the meetup event URL).
:::

::: flag excerpt
An excerpt will be rendered if any markdown content precedes an html comment `more`:
```markdown
<!-- more -->
```
An excerpt will only be rendered, if such comment exists. Please do not use headers in this section.
:::

## Naming Convention

Events will be sorted according to their date. In order to easily find a file in a growing list, please name them according to this naming convention: `<YYYY-MM>-<event>.md`. Add dashes for readability, for example  
`2019-07-cloud-native-bulgaria.md`

## Component Properties

::: flag subset
(default: `upcoming`) The subset of events that shall be rendered in this instance of the component. Specifying anything else than `upcoming` will render only past events. The ordering of displayed events is as follows:
* `upcoming` events are ordered by date, ascending
* `past` events are ordered by date, descending; i.e., the most recent event will be on top.
:::
