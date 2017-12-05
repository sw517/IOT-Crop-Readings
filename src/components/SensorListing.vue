<template>
  <div class="hello">
    <h1>Device Listing</h1>
    <h2>Show list of sensors here</h2>
    <div> All your devices will be prefixed with: {{$route.params.site}}_{{$route.params.location}}</div>
  </div>
</template>

<script>

export default {
  name: 'SensorListing',
  data() {
    return {
      test: [],
    };
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h1, h2 {
  font-weight: normal;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
