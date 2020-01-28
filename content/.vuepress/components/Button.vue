<template>
    <div class="button">
        <a :href=url target="_blank" rel="noopener noreferrer">
            <img :src=img />
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
    margin 1rem
    padding .5rem
    background-color $kudoBlueColor //$foregroundColor
    border-radius 8px
    text-align center
    flex-grow 1
    flex-basis 30%
    line-height 1.7em
    opacity 1
    .text
        font-weight lighter
        color #ffffff
    &:hover
        background-color lighten($kudoBlueColor, 20%)
    b
        color $kudoEggplantLightColor
    img
        display block
        margin-top .3em
        margin-left auto
        margin-right auto
        max-width 80px
        max-height 80px

@media (max-width: $MQMobile)
    .button
        max-width 100%
        padding 0 2.5rem

</style>
