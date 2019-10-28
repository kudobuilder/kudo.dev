<template>
    <div>
        <div v-for="story in stories" class="story">
            <div class="text">
                <img class="image" height="40" :src="image(story.frontmatter.logo)" :alt="story.frontmatter.company" />
                <span v-html="story.excerpt"></span>
            </div>
            <span class="name">– {{story.frontmatter.name}}&emsp;</span>
            <span class="position">{{story.frontmatter.position}}</span>
        </div>
    </div>
</template>

<script>
  export default {
    computed: {
      stories() {
        return this.$site.pages
          .filter(x => x.path.startsWith('/community/stories/'));
      }
    },
    methods: {
      image(file) {
        return this.$withBase("/images/logos/" + file)
      }
    }
  }
</script>

<style lang="stylus" scoped>
    .story
        margin 2rem 0
        padding .5rem 2rem
        .text
            font-style italic
            margin-block-start 0em;
        .name
            font-weight bold
            font-style italic
            font-size 1.0rem
            color $inlineCodeColor
        .position
            font-weight lighter
            font-style italic
            font-size 1.0rem
            color $inlineCodeColor
</style>