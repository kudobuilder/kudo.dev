<template>
    <div>
        <div v-for="page in authors">
            <Author :author="page.frontmatter" :link="page.path" :about="about !== undefined" />
        </div>
    </div>
</template>

<script>
  import Author from "./Author";
  export default {
    components: {Author},
    props: {
      about: {
        type: String,
        description: "if about is set to an authors alias, only this one author will be displayed. otherwise, all authors will be listed"
      }
    },
    computed: {
      authors() {
        const allAuthors = this.$site.pages.filter(x => x.frontmatter.author);
        if (this.about) {
          return allAuthors.filter(x => x.frontmatter.alias === this.about);
        } else {
          return allAuthors
        }
      },
    },
    methods: {
      image(file) {
        return this.$withBase("/images/authors/" + file)
      }
    }
  }
</script>
