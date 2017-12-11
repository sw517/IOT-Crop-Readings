<template>
  <div class="dash">
    <div class="sites">
      <!-- <h2>{{this.$route.params.location}}</h2> -->
      <el-card class="box-card notification-card">
        <div slot="header" class="clearfix">
          <span>Notifications</span>
        </div>
        <el-alert v-if="notifications.length == 0"
          title="No warnings found in Canterbury Gardens"
          type="success"
          show-icon>
        </el-alert>
        <div v-for="message in notifications" :key="message.index" class="text item">
          <el-alert
            :title='message.notification'
            :description='message.description'
            :type='message.status'
            show-icon>
          </el-alert>
        </div>
      </el-card>
      <el-row :gutter="20">
        <el-col class="graph-col" :span="4">
          <div class="grid-content" style="box-sizing: border-box">
            <div style="font-weight: 700">Gardens' Status</div>
            <div class="legend">
              <div class="el-icon-info okay"></div>All data in optimal range
              <div class="break"></div>
              <div class="el-icon-info warning"></div>Value found out of optimal range
              <div class="break"></div>
              <div class="el-icon-info error"></div>Null value returned from sensor
            </div>
          </div>          
        </el-col>
        <el-col class="graph-col" :span="4">
          <div id="gh1" v-bind:class="{ warning : gh1Warning, error : gh1Error }" class="grid-content grid-status">
            <div>Greenhouse 1</div>
          </div>
        </el-col>
        <el-col class="graph-col" :span="4">
          <div id="gh2" v-bind:class="{ warning : gh2Warning, error : gh2Error }" class="grid-content grid-status">
            <div>Greenhouse 2</div>
          </div>
        </el-col>
        <el-col class="graph-col" :span="4">
          <div id="gh3" v-bind:class="{ warning : gh3Warning, error : gh3Error }" class="grid-content grid-status">
            <div>Greenhouse 3</div>
          </div>
        </el-col>
        <el-col class="graph-col" :span="4">
          <div id="outside" v-bind:class="{ warning : outsideWarning, error : outsideError}" class="grid-content grid-status">
            <div>Outdoor Beds</div>
          </div>
        </el-col>
        <el-col class="graph-col" :span="4">
          <div id="house" v-bind:class="{ warning : houseWarning, error : houseError }" class="grid-content grid-status">
            <div>Main House</div>
          </div>
        </el-col>
      </el-row>
    </div>
    <div class="weather">
      <div class="weatherwidget">
        <weather 
          api-key="fcfefb32da5e585b808589366e32bc10"
          title="Canterbury Weather"
          latitude="51.280233"
          longitude="1.078909"
          bar-color="#545C66"
          text-color="#545C66"
          language="en"
          units="uk">
        </weather>
      </div>
    </div>
  </div>
</template>


<script>
import 'vue-weather-widget/dist/css/vue-weather-widget.css';
import VueWeatherWidget from 'vue-weather-widget';
import API from '../api';

export default {
  name: 'SensorListing',
  components: {
    weather: VueWeatherWidget,
  },
  data() {
    return {
      dataLoaded: false,
      sampleRate: '10minute',
      sensors: [],
      weather: {},
      notifications: [],
      gh1Warning: false,
      gh2Warning: false,
      gh3Warning: false,
      outsideWarning: false,
      houseWarning: false,
      gh1Error: false,
      gh2Error: false,
      gh3Error: false,
      outsideError: false,
      houseError: false,
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
      let arrayLength = 12;
      if (this.$myStore.state.dataTypes[data.type].sample_rate === '10minute') {
        arrayLength = 72;
      } else if (this.$myStore.state.dataTypes[data.type].sample_rate === 'minute') {
        arrayLength = 320;
      }
      // eslint-disable-next-line
      const updatedArray = data.data[values].slice(Math.max(data.data[values].length - arrayLength, 0));
      updatedArray.forEach(([time, reading]) => {
        object.labels.push(time);
        object.datasets[0].data.push(reading);
      });
      this.sensors.push(object);
      this.processData(object, false);
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
          // if (reading == null) return; // Skip any null values
          const newTime = this.createDate(time);
          objectHum.labels.push(newTime);
          objectHum.datasets[0].data.push(reading);
        });
        this.sensors.push(objectHum);
        this.processData(objectHum, true);
      }
    },
    // Check sensor data against assignment brief specification.
    // e.g Lettuce must be between 7 and 29 degrees.
    // Values are assessed by 2 units more than their optimum condition.
    // e.g If optimum temperature is 8°C to 10°C, the range is increased to 6°C to 12°C
    // in order to avoid unnecessary warning notifications for 1°C out of bounds.
    processData(object, humidity) {
      // GH1 Cactus Temperature
      if (object.key === 'gh1_plantzone_1_temp' && humidity === false) {
        object.datasets[0].data.forEach((value, index) => {
          const timeStamp = this.createDate(object.labels[index]);
          if (this.isWinter(object.labels[index]) && this.isNight(object.labels[index])) {
            if (value < 6 || value > 12) {
              let status = 'warning';
              let notification = `[${timeStamp}] Warning: ${object.name} was at ${value}°C`;
              const description = 'In winter at night, temperature for cactae should be between 8°C and 10°C';
              if (value == null) {
                notification = `[${timeStamp}] Warning: ${object.name} is returning null value`;
                status = 'error';
              }
              this.notifications.push({ index, notification, description, status });
              this.setStatus(object, status);
            }
          } else if (value < 5 || value > 31) {
            let notification = `[${timeStamp}] Warning: ${object.name} was at ${value}°C`;
            let status = 'warning';
            if (value == null) {
              notification = `[${timeStamp}] Warning: ${object.name} is returning null value`;
              status = 'warning';
            }
            const description = 'Temperature for cactae should be between 7°C and 29°C during the day';
            this.notifications.push({ index, notification, description, status });
            this.setStatus(object, status);
          }
        });
      } /* GH1 Cactus Light */ else if (object.key === 'gh1_plantzone_1_lux') {
        object.datasets[0].data.forEach((value, index) => {
          const timeStamp = this.createDate(object.labels[index]);
          if (value < 0.7 && !this.isNight(object.labels[index])) {
            let notification = `[${timeStamp}] Warning: ${object.name} was at ${value} lux`;
            let status = 'warning';
            if (value == null) {
              notification = `[${timeStamp}] Warning: ${object.name} is returning null value`;
              status = 'error';
            }
            const description = 'Cactae need more light';
            this.notifications.push({ index, notification, description, status });
            this.setStatus(object, status);
          }
        });
      } /* GH1 Cactus Moisture */ else if (object.key === 'gh1_plantzone_1_moisture') {
        object.datasets[0].data.forEach((value, index) => {
          // console.log(object);
          const timeStamp = this.createDate(object.labels[index]);
          if (value > 60) {
            let notification = `[${timeStamp}] Warning: ${object.name} was at ${Math.round(value)}% vwc`;
            let status = 'warning';
            if (value == null) {
              notification = `[${timeStamp}] Warning: ${object.name} is returning null value`;
              status = 'error';
            }
            const description = 'Cactae should be kept fairly dry';
            this.notifications.push({ index, notification, description, status });
            this.setStatus(object, status);
          }
        });
      } /* GH1 Cactus Humidity */ else if (object.key === 'gh1_plantzone_1_temp-hum') {
        object.datasets[0].data.forEach((value, index) => {
          const timeStamp = object.labels[index];
          if (value > 60) {
            let status = 'warning';
            let notification = `[${timeStamp}] Warning: ${object.name} was at ${Math.round(value)}%`;
            if (value == null) {
              notification = `[${timeStamp}] Warning: ${object.name} is returning null value`;
              status = 'error';
            }
            const description = 'Humidity for cactae should be below 40%';
            this.notifications.push({ index, notification, description, status });
            this.setStatus(object, status);
          }
        });
      } /* GH2 Lettuce Temperature */ else if (object.key === 'gh2_plantzone_1_temp') {
        object.datasets[0].data.forEach((value, index) => {
          const timeStamp = this.createDate(object.labels[index]);
          if (value < 5 || value > 20) {
            let status = 'warning';
            let notification = `[${timeStamp}] Warning: ${object.name} was at ${value}°C`;
            if (value == null) {
              notification = `[${timeStamp}] Warning: ${object.name} is returning null value`;
              status = 'error';
            }
            const description = 'Temperature for lettuce should be between 7°C and 18°C';
            this.notifications.push({ index, notification, description, status });
            this.setStatus(object, status);
          }
        });
      } /* GH3 Seedling Temperature */ else if (object.key === 'gh3_seed_temp') {
        object.datasets[0].data.forEach((value, index) => {
          const timeStamp = this.createDate(object.labels[index]);
          if (value < 280 || value > 300) {
            let status = 'warning';
            // let notification = `[${timeStamp}] Warning: ${object.name} was at ${value}°C`;
            let notification = `[${timeStamp}] Warning: ${object.name} was at ${value}K`;
            if (value == null) {
              notification = `[${timeStamp}] Warning: ${object.name} is returning null value`;
              status = 'error';
            }
            // const description = 'Temperature for seedlings should be between 10°C and 26°C';
            const description = 'Temperature for seedlings should be between 280K and 300K';
            this.notifications.push({ index, notification, description, status });
            this.setStatus(object, status);
          }
        });
      } /* Outdoor Muck Heap Temperature */ else if (object.key === 'outside_heap_temp' && humidity === false) {
        object.datasets[0].data.forEach((value, index) => {
          const timeStamp = this.createDate(object.labels[index]);
          if (value < 30 || value > 48) {
            let status = 'warning';
            let notification = `[${timeStamp}] Warning: ${object.name} was at ${value}°C`;
            if (value == null) {
              notification = `[${timeStamp}] Warning: ${object.name} is returning null value`;
              status = 'error';
            }
            const description = 'Temperature for compost heap should be around 40°C';
            this.notifications.push({ index, notification, description, status });
            this.setStatus(object, status);
          }
        });
      } /* Outdoor Muck Heap Humidity */ else if (object.key === 'outside_heap_temp-hum') {
        // console.log('work');
        object.datasets[0].data.forEach((value, index) => {
          const timeStamp = object.labels[index];
          if (value < 80) {
            let status = 'warning';
            let notification = `[${timeStamp}] Warning: ${object.name} was at ${value}%`;
            if (value == null) {
              notification = `[${timeStamp}] Warning: ${object.name} is returning null value`;
              status = 'error';
            }
            const description = 'Humidity for compost heap should be high';
            this.notifications.push({ index, notification, description, status });
            this.setStatus(object, status);
          }
        });
      } /* Outdoor Field Temperature */ else if (object.key === 'outside_field_temp') {
        // console.log('work');
        object.datasets[0].data.forEach((value, index) => {
          const timeStamp = this.createDate(object.labels[index]);
          if (value < 20) {
            let status = 'warning';
            let notification = `[${timeStamp}] Warning: ${object.name} was at ${value}%`;
            if (value == null) {
              notification = `[${timeStamp}] Warning: ${object.name} is returning null value`;
              status = 'error';
            }
            const description = 'Temperature for outdoor crops should be kept cool below 20°C';
            this.notifications.push({ index, notification, description, status });
            this.setStatus(object, status);
          }
        });
      }
    },
    isNight(dateString) {
      const tempArray = dateString.split('T');
      const time = tempArray[1];
      const timeSplit = time.split(':');
      const hour = timeSplit[0];
      let isNight = false;
      if (hour > 16 || hour < 6) {
        isNight = true;
      }
      return isNight;
    },
    isWinter(dateString) {
      const tempArray = dateString.split('T');
      const date = tempArray[0];
      const dateSplit = date.split('-');
      const month = dateSplit[1];
      let isWinter = false;
      if (month > 11 || month < 4) {
        isWinter = true;
      }
      return isWinter;
    },
    setStatus(object, status) {
      this.$myStore.state.sites.forEach((site) => {
        site.zones.forEach((zone) => {
          if (object.key.includes(`${site.id}_${zone.id}`)) {
            if (status === 'warning') {
              if (site.id === 'gh1') this.gh1Warning = true;
              else if (site.id === 'gh2') this.gh2Warning = true;
              else if (site.id === 'gh3') this.gh3Warning = true;
              else if (site.id === 'outside') this.outsideWarning = true;
              else if (site.id === 'house') this.houseWarning = true;
            }
            if (status === 'error') {
              if (site.id === 'gh1') this.gh1Error = true;
              else if (site.id === 'gh2') this.gh2Error = true;
              else if (site.id === 'gh3') this.gh3Error = true;
              else if (site.id === 'outside') this.outsideError = true;
              else if (site.id === 'house') this.houseError = true;
            }
          }
        });
      });
    },
    getWeather() {
      API.requestWeather()
        .then((response) => {
          this.formatWeather({ data: response.data });
        });
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
    // Format weather data from the weather API
    // *** NOT USED NOW THAT A COMPONENT HAS BEEN ADDED FROM VUE
    formatWeather(weatherData) {
      // Temp from API is in Kelvin therefore minus 273.15 from all temps
      this.weather = {
        location: weatherData.data.name,
        temp: weatherData.data.main.temp - 273.15,
        hum: weatherData.data.main.humidity,
        description: weatherData.data.weather[0].description,
      };
    },
  },
  watch: {
    $route() {
      this.getDevices();
    },
  },
  // updated() {
  //   this.updateStatus();
  // },
  created() {
    this.getDevices();
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
  border: 3px solid #1e931e;
  box-sizing: border-box;
  box-shadow: 0 0 12px 4px #0080005c;
}
.grid-status.warning {
  border-color: #eb9e05;
}
.grid-status.warning.error,
.grid-status.error {
  border-color: red;
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

.text {
    font-size: 14px;
  }
.item {
  margin-bottom: 18px;
}
.clearfix:before,
.clearfix:after {
  display: table;
  content: "";
}
.clearfix:after {
  clear: both
}
.box-card {
  width: 480px;
}
.box-card.notification-card {
  width: 100%;
  text-align: left;
}
.el-icon-info {
  padding: 10px 10px 0 0;
  clear: both;
}
.el-icon-info.okay {
  color:#1e931e;
}
.el-icon-info.warning {
  color:#eb9e05;
}
.el-icon-info.error,
.el-icon-info.error.warning {
  color:red;
}
.legend {
  text-align: left;
}
</style>
<style>
.notification-card .el-card__body {
  max-height: 175px;
  overflow-y: auto;
}
</style>