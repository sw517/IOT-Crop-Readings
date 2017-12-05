<template>
  <div class="hello">
    <h1>Device Details</h1>
    <h2>Data from the {{$route.params.sensor}} sensor</h2>
    <LineChart
      :width="400"
      :height="200"
      :chart-data="currentData"
      :options="{ maintainAspectRatio: false }"
    />

  </div>
</template>

<script>
import API from '../api';
import LineChart from './LineChart';

export default {
  name: 'SensorDetails',
  components: {
    LineChart,
  },
  data() {
    return {
      readings: {},
      lineData: {},
      msg: '',
    };
  },
  created() {
    API.requestDevice({
      device_id: this.$route.params.sensor,
      sample_rate: (this.$route.params.sample_rate || 'minute'),
    })
      .then((response) => {
        // Iterate through the dataTypes from store.js.
        // Then iterate through the sites from store.js.
        // Compare the ID of the current site with the site_id
        // from the requested device.
        // If the ID of the site is the same as the device's site_id,
        // then set the $values variable as the dataType's values from Store.js.

        // for (dataType in this.$myStore.state.dataTypes) {
        //   for (site in this.$myStore.state.sites) {
        //     if (site.id == device_id.site_id) {
        //       /* eslint no-console: 0 */
        //       console.log(dataType);
        //       const $values = dataType.values;
        //     }
        //   }
        // }
        const $values = 'gas_values';
        response.data[$values].length = 20;
        this.readings = response.data;
        this.lineData = this.formatData();
      });
  },
  methods: {
    formatData() {
      const object = {
        labels: [],
        datasets: [
          {
            label: 'Reading (ppm)',
            backgroundColor: '#333',
            data: [],
          },
        ],
      };
      const $values = 'gas_values';
      this.readings[$values].forEach(([time, reading]) => {
        object.labels.push(time);
        object.datasets[0].data.push(reading || 0);
      });
      return object;
    },
  },
  computed: {
    currentData() {
      return this.lineData;
    },
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
