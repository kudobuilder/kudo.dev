<template>
    <div class="author">
        <div v-if="author.alias" class="about">
            <img v-if="author.avatar" class="image clip-circle" :src="image(author.avatar)" :alt="author.name" align="right" />

            <!-- For blog posts, `about` should be true -->
            <span v-if="this.about">
                <strong>About the author</strong>
                <br/>
            </span>
            <span v-if="author.about">{{author.about}}</span>

            <!-- render a link to the author page, and to github/twitter etc if given -->
            <span v-if="this.link">Find <a :href="this.link">{{author.name}}</a> on</span>
            <span v-else>Find {{author.name}} on</span>

            <span v-if="author.alias">
                    <a v-bind:href="'https://github.com/' + author.alias"
                       target="_blank"
                       rel="noopener noreferrer">GitHub</a><OutboundLink/>
            </span>
            <!-- twitter alias is optional -->
            <span v-if="author.twitter">
                    <a v-bind:href="'https://twitter.com/' + author.twitter"
                       target="_blank"
                       rel="noopener noreferrer">Twitter</a><OutboundLink/>
            </span>
            <!-- linkedin alias is also optional -->
            <span v-if="author.linkedin">
                    <a v-bind:href="'https://linkedin.com/in/' + author.linkedin"
                       target="_blank"
                       rel="noopener noreferrer">LinkedIn</a><OutboundLink/>
            </span>
        </div>

    </div>
</template>

<script>
  export default {
    props: {
      author: {
        type: Object,
        description: "the author's metadata provided as a JSON object"
      },
      about: {
        type: Boolean,
        description: "If true, this author will be rendered as a reference to one specific author."
      },
      link: {
        type: String,
        description: "(optional) the link to the author's page"
      }
    },
    methods: {
      image(file) {
        return this.$withBase("/images/authors/" + file)
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
