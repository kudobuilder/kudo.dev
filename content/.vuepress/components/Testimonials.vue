<template>
    <div>
        <div v-for="ref in testimonials" class="testimonial">
            <div class="text">
                <img class="image" height="40" :src="image(ref.frontmatter.logo)" :alt="ref.frontmatter.company" />
                <span v-html="ref.excerpt"></span>
            </div>
            <span class="name">– {{ref.frontmatter.name}}&emsp;</span>
            <span class="position">{{ref.frontmatter.position}}</span>
        </div>
    </div>
</template>

<script>
  export default {
    computed: {
      testimonials() {
        return this.$site.pages
          .filter(x => x.path.startsWith('/community/testimonials/'));
      }
    },
    methods: {
      image(file) {
        return this.$withBase("/images/testimonials/" + file)
      }
    }
  }
</script>

<style lang="stylus" scoped>
    .testimonial
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