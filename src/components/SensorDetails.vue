<template>
  <div class="hello">
    <h1>Device Details</h1>
    <h2>Data from the {{$route.params.sensor}} sensor</h2>
    <LineChart
      :width="400"
      :height="200"
      :chart-data="currentData"
      :options="{maintainAspectRatio: false}"
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
  data () {
    return {
      readings: {},
      lineData: {},
      msg: ''
    }
  },
  created() {
    console.log(this.$route);
    API.requestDevice({
      device_id: this.$route.params.sensor,
      sample_rate: (this.$route.params.sample_rate || 'minute')
    })
      .then ((response) => {
        response.data[this.$route.params.values].length = 20;
        this.readings = response.data;
        this.lineData = this.formatData();
      })
  },
  methods: {
    formatData() {
      const object = {
        labels: [],
        datasets: [
          {
            label: 'Reading (ppm)',
            data: [],
          }
        ],
      };
      console.log(this.readings);
      this.readings[this.$route.params.values].forEach(([time, reading]) => {
        object.labels.push(time);
        object.datasets[0].data.push(reading || 0);
      });
      return object;
    }
  },
  computed: {
    currentData(){return this.lineData;}
  }
}
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
