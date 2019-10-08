<template>
    <div class="author">
        <div v-if="author.alias" class="about">
            <img v-if="author.avatar" class="image clip-circle" :src="image(author.avatar)" :alt="author.name" align="right" />
            <strong>About the author</strong><br/>
            <span>{{author.about}}</span>
            <!-- at least alias is expected to be always be set for lookup -->
            <span v-if="author.alias">Find {{author.name}} on</span>
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
        </div>
        <div v-else class="about">Unknown author</div>
    </div>
</template>

<script>
  import json from '../../community/assets/authors.json';
  export default {
    props: {
      // the author's github alias
      alias: {
        type: String
      }
    },
    data(){
      return{
        authors: json.authors
      }
    },
    computed: {
      author() {
        const matches = this.authors.filter(x => x.alias === this.alias);
        if (matches.length !== 0) {
          return matches[0]
        } else {
          return { name: "Unknown" }
        }
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