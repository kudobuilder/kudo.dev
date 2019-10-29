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
      },
      kind: {
        type: String,
        description: "The kind of author entries shall be filtered for. Only applicable if `about` isn't set",
        validator: (val) => ['contributor', 'other'].includes(val)
      }
    },
    computed: {
      authors() {
        const allAuthors = this.$site.pages
          .filter(x => x.path.startsWith('/community/team/') && x.frontmatter.author)
          .sort();
        if (this.about) {
          return allAuthors.filter(x => x.frontmatter.alias === this.about);
        } else {
          // only filter if we shall produce a list of authors
          return this.kind ? allAuthors.filter(x => x.frontmatter.kind === this.kind) : allAuthors;
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
