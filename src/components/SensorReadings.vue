<template>
  <div id="wrapper">
    <router-link
      :to="{
        name: 'SensorDetails',
        params: {
          site: 'gh2',
          location: 'co2Production',
          sensor: 'gh2_co2Production_gas',
          sample_rate: 'minute'
        }
      }"
    >
      This is a test
    </router-link>
  </div>
</template>

<script>
export default {
  name: 'SensorReadings',
  data() {
    return {
      msg: 'This is the Sensor Readings page',
    };
  },
  computed: {
    devices() {
      return this.$myStore.state.devices;
    },
  },
  created() {
    /* eslint no-console: 0 */
    console.log(this.$myStore.state);
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
