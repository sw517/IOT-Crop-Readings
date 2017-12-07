<template>
  <div class="dash">
    <div class="sites">
      <h1>Garden Status</h1>
      <h2>{{this.$route.params.location}}</h2>
      <el-row :gutter="20">
        <el-col class="graph-col" :span="4">
          <div class="grid-content">Current Status</div>
        </el-col>
        <el-col class="graph-col" :span="4"
          v-for="site in this.$myStore.state.sites"
          :key="site.key"
        >
          <div v-bind:id="site.id" class="grid-content grid-status">
            <div>{{site.name}}</div>
            <div class="el-icon-check"></div>
          </div>
        </el-col>
      </el-row>
    </div>
    <div class="weather">
      <h1>Canterbury Weather</h1>
      <el-row :gutter="20">
        <el-col class="graph-col" :span="8">
          <div class="grid-content w-status w-description">
            <h4>Conditions</h4>
            <h2>{{weather.description}}</h2>
          </div>
        </el-col>
        <el-col class="graph-col" :span="8">
          <div class="grid-content w-status w-temp">
            <h4>Temperature</h4>
            <h2>{{weather.temp}}°C</h2>
          </div>
        </el-col>
        <el-col class="graph-col" :span="8">
          <div class="grid-content w-status w-hum">
            <h4>Humidity</h4>
            <h2>{{weather.hum}}%</h2>
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
  background: #545c64;
  box-shadow: 0 0 12px 4px #ccc;
}
.w-status h2 {
  font-size: 30px;
  font-weight: 400;
}
.w-status h4 {
  font-size: 15px;
  font-weight: 400;
}
.el-icon-check,
.el-icon-close {
  margin-top: 10px;
}
</style>
