<template>
  <div id="app">
    <ThreeRendering />
  </div>
</template>

<script>
import ThreeRendering from './components/ThreeRendering.vue'

export default {
  name: 'App',
  components: {
    ThreeRendering
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
