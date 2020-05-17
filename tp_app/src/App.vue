<template>
<div>
    <md-tabs md-sync-route md-alignment="centered">
      <md-tab id="tab-home" md-label="Home" to="/" exact>
        <router-view></router-view>
      </md-tab>

      <md-tab id="tab-pages" md-label="Plant List" to="/list">
     <router-view></router-view>
      </md-tab>
    </md-tabs>
  </div>

</template>

<script>
export default {
  name: 'App',
  components: {   
  }
 
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
