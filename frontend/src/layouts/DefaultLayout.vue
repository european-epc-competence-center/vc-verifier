<template>
    <div class="d-flex justify-content-center h-100 m-md-1">
      <router-view />
      <div class="versiontag text-muted m-1">Version {{this.$store.state.version}}</div>
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
  