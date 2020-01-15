# Writing Documentation

## General Guidelines

**TODO:** link a more extensive list of guidelines

* Use simple language – documentation will be read by non-native speakers. 
* Stick to your wording – don't use a different word each time you refer to an action
  As an example, don't confuse your reader by asking them to _press the button, then click the button, and finally activate the button_. Use either of those verbs and stick to it.
* Address your reader directly – i.e. write _you can do X_ instead of _we can do X_.
* Add exhaustive links – if you refer to something that's documented, link to it. If it's not documented, create that documentation.

## Formatting Pages

* Make use of the documented [custom components](#custom-components) in order to establish a consistent documentation.
* Prefer custom components over tables. Tables don't render well on mobile phones.

## Custom Components

This documentation uses a few custom components which are meant to help writing better documentation.

- The [BlogIndex](blog-index.md) component is used to render previews and links for all blog posts.
- The [EventsIndex](events-index.md) component is used to render upcoming and past events.
- The [CustomBadge](custom-badge.md) should be used to highlight software versions capability (e.g. introduction or deprecation).
- The [custom block](custom-blocks.md) `flag` notation should be used to document command line flags, CLI commands, or other code related functionality.
- The [custom block](custom-blocks.md) `attribute` notation should be used to document YAML file structure

## VuePress native functionality

- There is no need to create _table of content_ (TOC) manually. VuePress supports adding a TOC by simply adding a `[[toc]]` at the according position. The `[[toc]]` will render h2 and h3 headers. **Note:** if you want to accompany the TOC with a header _Table of Contents_, then you need to format this header with plain html `<h2>Your Header</h2>` on order to not have it listed in the TOC.

Some code snippets are included from KUDO that is included as a [Git submodule](https://git-scm.com/docs/git-submodule). When updating the docs for a new KUDO release, the submodule has to be updated as well. This is done by running
```
cd kudo
git checkout %tag-of-release%
```
and committing this to KUDO.
