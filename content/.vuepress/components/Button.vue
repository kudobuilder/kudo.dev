<template>
    <a :href=url>
        <div class="button">
            <img :src=img width="200px" />
            {{text}}
        </div>
    </a>
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
    //border-top 1px solid $borderColor
    //border-bottom 1px solid $borderColor
    background-color lighten($kudoBlueColor, 95%)
    border-top-color lighten($kudoBlueColor, 80%)
    border-top-style dashed
    border-top-width 1px
    border-radius 8px
    font-weight lighter
    flex-grow 1
    flex-basis 30%
    line-height 1.7em
    text-align center
    opacity 1
    &:hover
        //background-color lighten($kudoBlueColor, 98%)
        opacity .3
    b
        color $kudoEggplantLightColor
    img
        display block
        margin-left auto
        margin-right auto
        width 40px
</style>
