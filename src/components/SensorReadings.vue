<template>
  <div class="dash">
    <div class="sites">
      <h1>Garden Status</h1>
      <h2>{{this.$route.params.location}}</h2>
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
      <el-row :gutter="20">
        <el-col class="graph-col" :span="4">
          <div class="grid-content">Current Status</div>
        </el-col>
        <el-col class="graph-col" :span="4"
          v-for="site in this.$myStore.state.sites"
          :key="site.key"
        >
          <div class="grid-content grid-status">
            {{site.name}}
          </div>
        </el-col>
      </el-row>
    </div>
    <div class="weather">
      <h1>Current Weather Conditions</h1>
      <el-row :gutter="20">
        <el-col class="graph-col" :span="8">
          <div class="grid-content w-status w-description">
            {{weather.description}}
          </div>
        </el-col>
        <el-col class="graph-col" :span="8">
          <div class="grid-content w-status w-temp">
            {{weather.temp}}°C
          </div>
        </el-col>
        <el-col class="graph-col" :span="8">
          <div class="grid-content w-status w-hum">
            {{weather.hum}}%
          </div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
import API from '../api';

export default {
  name: 'SensorListing',
  components: {
  },
  data() {
    return {
      dataLoaded: false,
      sampleRate: '10minute',
      sensors: [],
      weather: {},
    };
  },
  methods: {
    getDevices() {
      this.dataLoaded = false;
      this.sensors = [];
      let sensors = [];
      this.$myStore.state.sites.forEach((site) => {
        site.zones.forEach((zone) => {
          const locationString = `${site.id}_${zone.id}`;
          sensors = sensors.concat(this.$myStore.state.zones[locationString]);
        });
      });
      return new Promise((resolve) => {
        // eslint-disable-next-line
        for (const sensor of sensors) {
          const currentSampleRate = this.$myStore.state.dataTypes[sensor.type].sample_rate;
          API.requestDevice({
            device_id: sensor.name,
            sample_rate: currentSampleRate,
          })
            .then((response) => {
              // console.log({ data: response.data, type: sensor.type });
              this.formatData({ data: response.data, type: sensor.type });
            });
        }
        this.dataLoaded = true;
        resolve();
      });
    },
    formatData(data) {
      if (!data) return;
      const unitKey = this.$myStore.state.dataTypes[data.type].unit;
      const object = {
        key: data.data.id,
        name: data.data.name,
        labels: [],
        datasets: [
          {
            label: data.data[unitKey] || 'Reading',
            data: [],
          },
        ],
      };
      const { values } = this.$myStore.state.dataTypes[data.type];
      data.data[values].length = 14;
      data.data[values].forEach(([time, reading]) => {
        object.labels.push(time);
        object.datasets[0].data.push(reading || 0);
      });
      this.sensors.push(object);
    },
    processData() {
    },
    getWeather() {
      API.requestWeather()
        .then((response) => {
          // console.log({ data: response.data, type: sensor.type });
          this.formatWeather({ data: response.data });
        });
    },
    formatWeather(weatherData) {
      console.log(weatherData);
      // Temp from API is in Kelvin therefore minus 273.15 from all temps
      this.weather = {
        location: weatherData.data.name,
        temp: weatherData.data.main.temp - 273.15,
        hum: weatherData.data.main.humidity,
        description: weatherData.data.weather[0].description,
        // minTemp: weatherData.data.main.temp_min - 273.15,
        // maxTemp: weatherData.data.main.temp_max - 273.15,
      };
      console.log('OBJECT');
      console.log(this.weather);
    },
  },
  watch: {
    $route() {
      this.getDevices();
      this.processData();
      this.getWeather();
    },
  },
  created() {
    this.getDevices();
    this.processData();
    this.getWeather();
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
.grid-status {
  background: #1e931e;
  color: #fff;
  box-shadow: 0 0 12px 4px #0080005c;
}
.grid-status.error {
  background: red;
}
.weather {
  margin-top: 60px;
}
.w-status {
  text-transform: capitalize;
  color: #fff;
  box-shadow: 0 0 12px 4px #ccc;
}
.w-description {
  background: #3a8ee6;
}
</style>
