# Custom Blocks

Custom blocks are similar to code blocks, just that they are enclosed in triple colons instead of triple backticks. The type of the custom block is denoted by the word that follows the opening colons on the same line, separated by a space, and an optional title:

```markdown
::: <type> <optional title>
Your markdown content goes here.
:::
```

::: warning Special Characters in Titles
You may need to url encode certain special characters in order to render them **in the flag title**. `<` or `>` have to be urlencoded with `&lt;` and `&gt;`, respectively. This is because VuePress allows rendering Vue components in the title, which are referenced in html markup notation like `<CustomBadge text="beta"/>`.
:::

## Custom Block Properties

Custom blocks have two properties:

::: block type
The type is defined by the first word following the opening `:::` colons of the block:
* `tip` renders a green block. Use this for general hints like best practices or ideal use cases.
* `warning` renders a yellow block. Use this for anything the user should be aware about, like deprecation notes, experimental or beta features, etc.
* `danger` renders a red block. Use this for known issues, incompatibilities, or potentially destructive operations.
:::

::: block title
(optional) The title is defined by plain text following the `type`, separated by a space. See the note above about special characters in titles.
:::

Any markdown you add between the opening and closing `:::` will be rendered as block content.

## Pre-configured custom blocks

This documentation comes with pre-configured custom block formatting for the following types.

::: tip Configuration
These custom blocks are build on top of `vuepress-plugin-container`, which is defined as a dependency in `package.json`, and configured in `config.js` via the `container` plugin.
Their styling is defined in `/content/.vuepress/theme/styles/*.styl` and imported in `/content/.vuepress/theme/styles/index.styl`.
:::

### Flag

Use this to document CLI commands, configuration flags, and similar ways to configure and customize KUDO:

```markdown
::: flag kubectl kudo version
Print the current KUDO package version.
:::
```

The above example renders like this:
::: flag kubectl kudo version
Print the current KUDO package version.
:::

### Attribute

Use this to document structure of YAML files.

```markdown
::: attribute name
A required attribute which provides a name to the parameter.
:::
```

The above example renders like this:
::: attribute name
A required attribute which provides a name to the parameter.
:::
