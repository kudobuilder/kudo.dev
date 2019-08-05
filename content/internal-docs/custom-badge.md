# Custom Badge

The `CustomBadge` <CustomBadge text="That's me"/> component should be used to highlight software versions capability (e.g. introduction or deprecation). It can and should be used especially when documenting flags or CLI commands, and can as well be used for concepts that have been introduced, deprecated or removed in any given version. See the [examples](#examples) below.

::: tip There's also Custom Blocks  <CustomBadge text="Pro Tip"/>
If you want to notify about features that have known issues or incompatibilities, use [custom blocks](custom-blocks.md) instead – especially if you want to write a couple sentences to provide meaningful context. You can also write a big fat deprecation notice using a custom block.

What you are reading at this very moment is a custom `tip` block which uses a CustomBadge in its header.
:::

## Properties

The `CustomBadge` has three properties:
::: flag type
(Default: `tip`) Defines the type of the block  
* `tip` or `green` render a green badge. Use these if you want to inform about the version that introduced a feature, or tag a version or feature as `stable`.
* `warning`, `warn` and `yellow` each render a yellow block. Use these to tag anything the user should be aware about, like experimental features.
* `error` renders a red badge. Use this to tag deprecated or removed features; features with known issues or are potentially destructive operations.
:::

::: flag text
The text that shall be displayed in the badge. Keep it short.
:::

::: flag vertical
(Default: `top`) The setting for the `verticalAlign` CSS property.
:::

## Examples

### Documenting CLI commands

::: flag kubectl kudo &lt;new feature&gt;
 <CustomBadge text="0.1.0"/>
This awesome new feature has been introduced in 0.1.0.  
`<CustomBadge text="0.1.0"/>` renders this badge.
:::

::: flag kubectl kudo &lt;deprecated command&gt;
 <CustomBadge type="warning" text="experimental in 0.5.0"/>
This feature has been deprecated in 0.5.0.  
`<CustomBadge type="warning" text="experimental in 0.5.0"/>` renders this badge.
:::

### Tagging Feature Availability

You can use CustomBadges to highlight a features availability:

#### Something New and Shiny <CustomBadge text="0.4.0"/>
`<CustomBadge text="0.4.0"/>` renders this badge.

#### Under Construction <CustomBadge type="warning" text="experimental"/>
`<CustomBadge type="warning" text="experimental"/>` renders this badge.

#### We've got Something Better <CustomBadge type="error" text="deprecated"/>
`<CustomBadge type="error" text="deprecated"/>`  renders this badge.

### Tagging Versions

Other applicable usages of CustomBadges would be tagging versions or feature with respect to their availability:

* KUDO v0.2.0 <CustomBadge text="experimental" type="warning"/>  
  `<CustomBadge text="experimental" type="warning"/>` renders this badge.
* KUDO v0.3.0 <CustomBadge text="beta" type="warning"/>  
  `<CustomBadge text="beta" type="warning"/>` renders this badge.
* KUDO v0.4.0 <CustomBadge text="stable" />  
  `<CustomBadge text="stable" />` renders this badge.
* KUDO v0.6.0-SNAPSHOT <CustomBadge text="snapshot" type="error"/>  
  `<CustomBadge text="snapshot" type="error"/>` renders this badge.
