<template>
    <div class="embed-container">
        <iframe width="560" height="315" :src="url" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
    </div>
</template>

<script>
  export default {
    props: {
      url: {
        type: String,
        description: "The video URL"
      }
    }
  }
</script>

<style lang="stylus" scoped>
    .embed-container {
        position: relative;
        padding-bottom: 56.25%; /* ratio 16x9 */
        height: 0;
        overflow: hidden;
        width: 100%;
        height: auto;
    }
    .embed-container iframe {

        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
    }
</style>
