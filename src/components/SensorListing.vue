<template>
  <div class="hello">
    <h1>Device Listing</h1>
    <h2>{{this.$route.params.location}}</h2>
    <!-- <div> All your devices will be prefixed with: {{$route.params.site}}_{{$route.params.location}}</div> -->
    <el-row :gutter="20">
      <el-col class="graph-col" :span="12"
        v-if="dataLoaded"
        v-for="sensor in sensors"
      >
        <div class="grid-content">
          <h3>{{sensor.name}}</h3>
          <LineChart
            :key="sensor.key"
            :name="sensor.name"
            :width="500"
            :height="400"
            :chart-data="sensor"
            :options="{ maintainAspectRatio: false }"
          />
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import API from '../api';
import LineChart from './LineChart';

export default {
  name: 'SensorListing',
  components: {
    LineChart,
  },
  data() {
    return {
      dataLoaded: false,
      sampleRate: 'hour',
      sensors: [],
    };
  },
  methods: {
    getDevices() {
      this.dataLoaded = false;
      this.sensors = [];
      const locationString = `${this.$route.params.site}_${this.$route.params.location}`;
      const sensors = this.$myStore.state.zones[locationString];
      // eslint-disable-next-line
      for (const sensor of sensors) {
        API.requestDevice({
          device_id: sensor.name,
          sample_rate: this.sampleRate,
        })
          .then((response) => {
            this.formatData({ data: response.data, type: sensor.type });
          });
      }
      this.dataLoaded = true;
    },
    formatData(data) {
      const unitKey = this.$myStore.state.dataTypes[data.type].unit;

      const object = {
        key: data.data.id,
        name: data.data.name,
        labels: [],
        datasets: [
          {
            backgroundColor: '#fc7976',
            label: data.data[unitKey] || 'Reading',
            data: [],
          },
        ],
      };
      const { values } = this.$myStore.state.dataTypes[data.type];
      data.data[values].length = 14;
      data.data[values].forEach(([time, reading]) => {
        console.log(time);
        object.labels.push(time);
        object.datasets[0].data.push(reading || 0);
      });
      this.sensors.push(object);
    },
    createDate(dateString) {
      var d = new Date();
      const dateTimeArray = dateString.split('T');
      const dateStr = dateTimeArray[0];
      const timeStr = dateTimeArray[1];
      const dateArray = dateStr.split('-');
      const timeArray = timeStr.split(':');
    
      //set Date() var
      d.setFullYear(dateArray[0]);
      d.setMonth((dateArray[1] - 1));
      d.setDate(dateArray[2]);
      d.setHours(timeArray[0]);
      d.setMinutes(timeArray[1]);
      // console.log(d);
      return d;
    },
  },
  watch: {
    $route() {
      this.getDevices()
        .then(this.formatData);
    },
  },
  created() {
    this.getDevices()
      .then(this.formatData);
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
