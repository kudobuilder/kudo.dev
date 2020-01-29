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
    margin 1rem
    padding .5rem
    background-color $kudoBlueColor
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
        max-height 80px

@media (max-width: $MQMobile)
    .button
        max-width 100%
        padding 0 2.5rem

</style>
