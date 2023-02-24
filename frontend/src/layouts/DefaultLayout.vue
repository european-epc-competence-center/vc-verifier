<template>
  <div class="d-flex justify-content-center h-100 m-md-1">
    <router-view />
    <a :href="`https://github.com/european-epc-competence-center/vc-verifier/releases/tag/v${this.$store.state.version}`"
      target="_blank" class="versiontag text-muted m-1">Version {{ this.$store.state.version }}</a>
  </div>
</template>
<script>
export default {
  name: 'DefaultLayout',
  components: {

  },
  setup() {

  }
}
</script>
  