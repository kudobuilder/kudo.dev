<template>
    <div>
        <div v-for="item in resources">
            <div class="resource">
                <div>
                    <span class="type">• {{ item.resourceType }} / </span>
                    <span class="title">{{ item.title }}</span>
                </div>
                <div class="inner">
                    <div v-if="item.details">{{ item.details }}</div>
                    <div>
                        <!-- more than one of the following might be set -->
                        <span v-if="item.video">
                            <a v-bind:href="item.video"
                               target="_blank"
                               rel="noopener noreferrer">Recording</a><OutboundLink/>
                        </span>
                        <span v-if="item.slides">
                            <a v-bind:href="item.slides"
                               target="_blank"
                               rel="noopener noreferrer">Slides</a><OutboundLink/>
                        </span>
                        <span v-if="item.url">
                            <a v-bind:href="item.url"
                               target="_blank"
                               rel="noopener noreferrer">Link</a><OutboundLink/>
                        </span>
                        <span v-if="item.author">by {{ item.author }}</span>
                        <span v-if="item.date">({{ item.date }})</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
  import json from '../../community/assets/resources.json';
  export default{
    data(){
      return{
        resources: json.resources.sort((a, b) => new Date(b.date) - new Date(a.date))
      }
    }
  }
</script>

<style lang="stylus" scoped>
    .resource
        padding 0.5rem
        padding-left 0rem
        margin 0rem 0
        line-height: 1.7rem
        .type
            color $inlineCodeColor
            padding .1rem 0rem
        .title
            font-weight bold
            font-size 1.0rem
            padding .1rem 0rem
        .inner
            margin-block-start 0em
            padding 0rem 1rem
</style>
