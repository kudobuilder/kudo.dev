<template>
    <div>
        <div v-for="post in posts" class="blog">
            <span class="date">{{ displayDate(post.frontmatter.date) }}&emsp;&emsp;/&emsp;&emsp;<router-link class="title" :to="post.path">{{ post.title }}</router-link></span>
            <p class="inner">
                <span v-html="excerptWithoutHeader(post)"></span>
                <span>(<router-link :to="post.path">read more</router-link>)</span>
            </p>
        </div>
    </div>
</template>

<script>
  export default {
    computed: {
      posts() {
        return this.$site.pages
          .filter(x => x.path.startsWith('/blog/') && !x.frontmatter.blog_index)
          .sort((a, b) => new Date(b.frontmatter.date) - new Date(a.frontmatter.date));
      }
    },
    methods: {
      displayDate(value) {
        return new Date(value).toLocaleDateString('en-US', { timeZone: 'UTC', year: 'numeric', month: 'long', day: 'numeric' })
      },
      /**
       * @param post the post that is rendered
       * @returns A {string} without headers, and paragraphs replaced with spans
       */
      excerptWithoutHeader(post) {
        return post.excerpt
          .replace(/<(\/?)h\d/g, "<$1span hidden") // hide any headers from the excerpt
          .replace(/<(\/?)p/g, "<$1span") // make the paragraph a span instead so we can format better
      }
    }
  }
</script>

<style lang="stylus" scoped>
    .blog
        margin 2rem 0
        .date
            font-weight normal
            font-size 1.0rem
            color $inlineCodeColor
            padding .1rem 0rem
        .title
            font-weight bold
            font-size 1.6rem
        .inner
            margin-block-start 0em;
            padding .5rem 1rem

</style>