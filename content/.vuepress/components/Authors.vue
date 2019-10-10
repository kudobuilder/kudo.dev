<template>
    <div class="author">
        <div v-for="page in authors">
            <div v-if="page.frontmatter.alias" class="about">
                <img v-if="page.frontmatter.avatar" class="image clip-circle" :src="image(page.frontmatter.avatar)" :alt="page.frontmatter.name" align="right" />
                <strong v-if="alias">About the author</strong>
                <strong v-else>{{page.frontmatter.name}}</strong>
                <br/>
                <span v-if="page.excerpt" v-html="excerptWithoutHeader(page)" />
                <!-- at least alias is expected to be always be set for lookup -->
                <span v-if="page.frontmatter.alias">Find <router-link :to="page.path">{{page.frontmatter.name}}</router-link> on</span>
                <span v-if="page.frontmatter.alias">
                    <a v-bind:href="'https://github.com/' + page.frontmatter.alias"
                       target="_blank"
                       rel="noopener noreferrer">GitHub</a><OutboundLink/>
                </span>
                <!-- twitter alias is optional -->
                <span v-if="page.frontmatter.twitter">
                    <a v-bind:href="'https://twitter.com/' + page.frontmatter.twitter"
                       target="_blank"
                       rel="noopener noreferrer">Twitter</a><OutboundLink/>
                </span>
            </div>
            <div v-else class="about">{{page.frontmatter.name}}</div>
        </div>
    </div>
</template>

<script>
  export default {
    props: {
      // the author's github alias, if the list should be filtered to display just this one
      alias: {
        type: String
      }
    },
    computed: {
      authors() {
        const allAuthors = this.$site.pages.filter(x => x.frontmatter.author);
        console.log(allAuthors);
        if (this.alias) {
          const matches = allAuthors.filter(x => x.frontmatter.alias === this.alias);
          if (matches.length !== 0) {
            return matches
          } else {
            return [{
              // if no page is found, create a dummy frontmatter to at least surface the error:
              frontmatter: {
                name: "Authored by " + this.alias
              }
            }]
          }
        } else {
          return allAuthors
        }
      },
    },
    methods: {
      image(file) {
        return this.$withBase("/images/authors/" + file)
      },
      /**
       * @param item the item that is rendered
       * @returns A {string} without headers, and paragraphs replaced with spans
       */
      excerptWithoutHeader(item) {
        return item.excerpt
          .replace(/<(\/?)h\d/g, "<$1span hidden") // hide any headers from the excerpt
          .replace(/<(\/?)p/g, "<$1span") // make the paragraph a span instead so we can format better
      }
    }
  }
</script>

<style lang="stylus" scoped>
    .author
        font-style: italic
        border-top-color $inlineCodeColor
        border-top-style dashed
        border-top-width 1px
        margin-top 2em
        width 100%
        line-height 1.7em
        img
            width 100px
        .about
            margin-top 2em
            width 100%
        .image
            margin-left 1.5em
        .clip-circle
            clip-path circle(50px at center)
    .author::after
        content ""
        clear both
        display table
</style>
