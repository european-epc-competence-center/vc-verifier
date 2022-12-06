<template>
    <div class="d-flex justify-content-center h-100 m-1">
      <router-view />
      <div class="versiontag text-light m-1">Version {{this.$store.state.version}}</div>
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
  