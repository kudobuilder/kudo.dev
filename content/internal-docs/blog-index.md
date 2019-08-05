# Blog Posts

The `BlogIndex` component renders blog posts. By default, it will process all pages located underneath `/blog/`, and will display a section for each post with a preview which is generated from the posts excerpt. Posts will be ordered by date with the more recent posts naturally listed first.

## Format

A simple example of a blog post would be this:

<!-- TODO: this could import an existing md file and then also render that one as an example -->

```markdown
<!-- blog-post-example.md -->
---
date: 2019-08-09
---

# Version x.y.z brings this New Cool Feature

This section will be rendered as an excerpt in the preview of the blog post.

<!-- more -->

## Dive into details here

Everything below the above comment line will not be rendered in the preview, but
will be displayed perfectly fine on the details view of your blog post.
```

There are a few things to know about writing blog posts, all of which you can see in the example above:

- A posts **date** is solely defined by the [frontmatter](https://jekyllrb.com/docs/front-matter/) parameter `date`. This is the only frontmatter data the `BlogIndex` component requires. The date format is `YYYY-MM-DD`.
- The blog post **title** is derived from the `h1` header as provided in the blog post markdown page. You don't have to provide a title in frontmatter. You can though, in case you want to specify a blog post title different from the page title. 
- `BlogIndex` will render an excerpt for each post that provides it. You can define an excerpt by simply adding an html comment that says `more` **below** the section that should be rendered as an excerpt.

::: tip
The excerpt should focus on the gist of the message, and not contain repetitive phrases that don't add much value. Prefer **KUDO x.y.z brings this New Cool Feature** over "we are proud to announce version x.y.z".
 
In order to keep previews slim, any headers within the excerpt will be hidden, and paragraphs will be changed to spans.
:::

## Naming Convention

Posts will be sorted according to their date. In order to find easily tell apart release announcements from other posts, please follow the following naming convention:
- **Release announcements**: `announcing-kudo-<version>.md`
- **Other blog posts**: `blog-YYYY-MM-<name>.md`
