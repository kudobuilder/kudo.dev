<template>
    <div>
        <div v-for="event in events">
            <div class="date-box">
                <div class="date-box date-background"/>
                <div class="date-number">{{ displayDay(event.frontmatter.date) }}</div>
                <div class="date-month">{{ displayMonth(event.frontmatter.date) }}</div>
            </div>
            <div class="event">
                <div>
                    <span class="location" v-if="event.frontmatter.location">{{ event.frontmatter.location }}</span>
                </div>
                <div class="title" v-if="event.frontmatter.topic">{{ event.frontmatter.topic }}</div>
                <div class="inner">
                    <div v-if="event.frontmatter.speaker">Speaker: {{ event.frontmatter.speaker }}</div>
                    <div v-if="event.frontmatter.event">
                        <span>Event: {{ event.frontmatter.event }}</span>
                        <span v-if="event.frontmatter.url">
                            <a v-bind:href="event.frontmatter.url"
                               target="_blank"
                               rel="noopener noreferrer">(event details)</a><OutboundLink/>
                        </span>
                    </div>
                    <!-- display an optional excerpt from the events markdown file -->
                    <div v-html="event.excerpt"/>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
  export default {
    props: {
      // whether to show 'upcoming' or 'past' events.
      subset: {
        type: String,
        default: 'upcoming'
      }
    },
    computed: {
      events() {
        var today = new Date();
        today.setHours(0,0,0,0);
        if (this.subset === 'upcoming') {
          return this.$site.pages
            .filter(x => x.path.startsWith('/community/events/') && x.frontmatter.event)
            .filter(x => new Date(x.frontmatter.date) >= today)
            .sort((a, b) => new Date(a.frontmatter.date) - new Date(b.frontmatter.date));
        } else {
          return this.$site.pages
            .filter(x => x.path.startsWith('/community/events/') && x.frontmatter.event)
            .filter(x => new Date(x.frontmatter.date) < today)
            .sort((a, b) => new Date(b.frontmatter.date) - new Date(a.frontmatter.date));
        }
      },
    },
    methods: {
      displayDay(dateString) {
        return new Date(dateString).toLocaleDateString('en-US', { timeZone: 'UTC', day: '2-digit' })
      },
      displayMonth(dateString) {
        return new Date(dateString).toLocaleDateString('en-US', { timeZone: 'UTC', month: 'short' })
      }
    }
  }
</script>

<style lang="stylus" scoped>
.event
    padding-left 4.5rem
    margin 2rem 0
    .location
        color $inlineCodeColor
        padding .1rem 0
    .title
        font-weight bold
        font-size 1.0rem
    .inner
        margin-block-start 0
        padding .5rem 1rem 0

.date-box
    position absolute
    display table
    text-align center

.date-background
    position absolute
    background-color $foregroundColor
    border-top-color $inlineCodeColor
    border-top-style dashed
    border-top-width 1px
    margin-top 0.2rem
    width 65px
    height 65px

.date-number
    position absolute
    font-size 1.6rem
    padding-top 1.2em
    width 65px
    height 65px

.date-month
    text-transform uppercase
    position absolute
    font-size 0.9rem
    font-weight lighter
    padding-top 1em
    width 65px
    height 65px

</style>
