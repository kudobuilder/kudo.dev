<template>
    <h1>{{text}}</h1>
</template>

<script>
  export default {
    props: {
      text: {
        type: String
      }
    }
  }
</script>

<style lang="stylus" scoped>
h1
    color $teaserHighlightColor
    text-align center
</style>
