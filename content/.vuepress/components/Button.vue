<template>
    <div class="button">
        <a :href=url target="_blank" rel="noopener noreferrer">
            <img :src="img" :alt="text" />
            <div class="text">{{text}}</div>
        </a>
    </div>
</template>

<script>
  export default {
    props: {
      text: {
        type: String
      },
      url: {
        type: String
      },
      img: {
        type: String
      }
    }
  }
</script>

<style lang="stylus" scoped>
.button
    max-width 30%
    margin .5rem
    padding .2rem
    border-style solid
    border-width 0
    border-top-width 1px
    border-bottom-width 1px
    border-radius 8px
    border-color $backgroundColor
    text-align center
    flex-grow 1
    flex-basis 30%
    line-height 1em
    opacity 1
    .text
        margin-top .2em
        font-weight lighter
        font-size .8em
        color $textColor
    &:hover
        border-color $codeBgColor
    img
        vertical-align middle
        margin-left auto
        margin-right auto
        max-height 80px

@media (max-width: $MQMobile)
    .button
        max-width 100%
        padding 0 2.5rem

</style>
