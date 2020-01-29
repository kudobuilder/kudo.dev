<template>
    <div class="logo">
        <a :href=url target="_blank" rel="noopener noreferrer">
            <img :src=img :alt=alt />
        </a>
    </div>
</template>

<script>
  export default {
    props: {
      url: {
        type: String
      },
      img: {
        type: String
      },
      alt: {
        type: String
      }
    }
  }
</script>

<style lang="stylus" scoped>
    .logo
        max-width 30%
        margin .4rem
        flex-grow 1
        opacity 1
        &:hover
            opacity .7
        img
            display block
            margin-left auto
            margin-right auto
            margin-top .3em
            max-height 80px

    @media (max-width: $MQMobile)
        .button
            max-width 100%
            padding 0 2.5rem

</style>
