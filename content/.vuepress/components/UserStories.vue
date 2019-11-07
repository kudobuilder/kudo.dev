<template>
    <div>
        <div v-for="story in stories">
            <div class="story">
                <img class="image" :src="image(story.frontmatter.logo)" :alt="story.frontmatter.company" />

                <div class="inner">
                    <span class="title">{{story.frontmatter.company}}</span>
                    <span v-html="story.excerpt"></span>
                    <span class="name">– {{story.frontmatter.name}}&emsp;</span>
                    <span class="position">{{story.frontmatter.position}}</span>
                </div>
            </div>
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
        padding 1rem
        margin-top .2rem
        background-color $codeBgColor
        font-style: italic
        line-height 1.7em
        img
            width 100px
        .title
            color $teaserHighlightColor
            font-weight bold
            font-size 1.4rem
        .image
            float right
            margin .8rem
            width 5rem
        .inner
            padding-left 1rem
            margin-block-start 0em;
            font-weight lighter
            font-size 0.9rem
        .name
            font-weight bold
            font-size 1.0rem
            color $teaserHighlightColor
        .position
            font-weight lighter
            font-size 1.0rem
            color $teaserHighlightColor
    .story::after
        content ""
        clear both
        display table
</style>
