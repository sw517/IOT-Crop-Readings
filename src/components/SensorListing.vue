<template>
  <div class="hello">
    <h1>Device Listing</h1>
    <h2>{{this.$route.params.location}}</h2>
    <!-- <div> All your devices will be prefixed with: {{$route.params.site}}_{{$route.params.location}}</div> -->
    <el-row :gutter="20">
      <el-col class="graph-col" :span="24"
        v-if="dataLoaded"
        v-for="sensor in sensors"
        :key="sensor.key"
      >
        <div class="grid-content">
          <h3>{{sensor.name}}</h3>
          <LineChart
            :key="sensor.key"
            :name="sensor.name"
            :width="500"
            :height="300"
            :chart-data="sensor"
            :options="{ maintainAspectRatio: false }"
          />
          <div>
            <h5>Sample rate - every {{sensor.sampleRate}} </h5>
          </div>
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
      sampleRate: '10minute',
      sensors: [],
    };
  },
  methods: {
    getDevices() {
      this.dataLoaded = false;
      this.sensors = [];
      const locationString = `${this.$route.params.site}_${this.$route.params.location}`;
      const sensors = this.$myStore.state.zones[locationString];
      return new Promise((resolve, reject) => {
        // eslint-disable-next-line
        for (const sensor of sensors) {
          const currentSampleRate = this.$myStore.state.dataTypes[sensor.type].sample_rate;
          API.requestDevice({
            device_id: sensor.name,
            sample_rate: currentSampleRate,
          })
            .then((response) => {
              this.formatData({ data: response.data, type: sensor.type });
            })
            .catch((e) => {
              this.errors.push(e);
              reject();
            });
        }
        this.dataLoaded = true;
        resolve();
      });
    },
    formatData(data) {
      if (!data) return;
      const unitKey = this.$myStore.state.dataTypes[data.type].unit;
      const graphColor = this.$myStore.state.dataTypes[data.type].graphColor;
      const object = {
        key: data.data.id,
        name: data.data.name,
        sampleRate: this.$myStore.state.dataTypes[data.type].sample_rate,
        labels: [],
        datasets: [
          {
            backgroundColor: graphColor || '#3a8ee6',
            label: data.data[unitKey] || 'Reading',
            data: [],
          },
        ],
      };
      // eslint-disable-next-line
      const { values } = this.$myStore.state.dataTypes[data.type];
      let arrayLength = 12;
      if (this.$myStore.state.dataTypes[data.type].sample_rate === '10minute') {
        arrayLength = 72;
      } else if (this.$myStore.state.dataTypes[data.type].sample_rate === 'minute') {
        arrayLength = 320;
      }
      // eslint-disable-next-line
      const updatedArray = data.data[values].slice(Math.max(data.data[values].length - arrayLength, 0));
      updatedArray.forEach(([time, reading]) => {
        if (reading == null) return; // Skip any null values
        const newTime = this.createDate(time);
        object.labels.push(newTime);
        object.datasets[0].data.push(reading || 0);
      });
      this.sensors.push(object);
      // HUMIDITY
      if (data.type === 'tempHumid') {
        const humScale = 'humidity_scale';
        const objectHum = {
          key: `${data.data.id}-hum`,
          name: `${data.data.name} - Humidity`,
          sampleRate: this.$myStore.state.dataTypes[data.type].sample_rate,
          labels: [],
          datasets: [
            {
              backgroundColor: 'orange' || '#3a8ee6',
              label: data.data[humScale] || 'Reading',
              data: [],
            },
          ],
        };
        // eslint-disable-next-line
        const { values } = this.$myStore.state.dataTypes[data.type];
        arrayLength = 12;
        // eslint-disable-next-line
        const updatedArray = data.data['humidity_value'].slice(Math.max(data.data['humidity_value'].length - arrayLength, 0));
        updatedArray.forEach(([time, reading]) => {
          if (reading == null) return; // Skip any null values
          const newTime = this.createDate(time);
          objectHum.labels.push(newTime);
          objectHum.datasets[0].data.push(reading || 0);
        });
        this.sensors.push(objectHum);
      }
    },
    createDate(dateString) {
      const d = new Date();
      const dateTimeArray = dateString.split('T');
      const dateStr = dateTimeArray[0];
      const timeStr = dateTimeArray[1];
      const dateArray = dateStr.split('-');
      const timeArray = timeStr.split(':');
      // set Date() var
      d.setFullYear(dateArray[0]);
      d.setMonth((dateArray[1] - 1));
      d.setDate(dateArray[2]);
      d.setHours(timeArray[0]);
      d.setMinutes(timeArray[1]);
      let mins = d.getMinutes();
      if (d.getMinutes() === 0) {
        mins = '00';
      } else {
        mins = d.getMinutes();
      }
      // eslint-disable-next-line
      const displayStr = d.getDate() + "/" + (d.getMonth() + 1) + " - " + d.getHours() + ":" + mins;
      return displayStr;
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
