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
            type="warning"
            show-icon>
          </el-alert>
          <!-- {{message.notification}} -->
        </div>
      </el-card>
      <el-row :gutter="20">
        <el-col class="graph-col" :span="4">
          <div class="grid-content">Gardens' Status</div>
        </el-col>
        <!-- <el-col class="graph-col" :span="4"
          v-for="site in this.$myStore.state.sites"
          :key="site.key"
        >
          <div v-bind:id="site.id" v-bind:class="{ error: `${site.id}Warning` }" class="grid-content grid-status">
            <div>{{site.name}}</div>
            <div class="el-icon-check"></div>
          </div>
        </el-col> -->
        <el-col class="graph-col" :span="4">
          <div id="gh1" v-bind:class="{ error : gh1Warning}" class="grid-content grid-status">
            <div>Greenhouse 1</div>
          </div>
        </el-col>
        <el-col class="graph-col" :span="4">
          <div id="gh2" v-bind:class="{ error : gh2Warning}" class="grid-content grid-status">
            <div>Greenhouse 2</div>
          </div>
        </el-col>
        <el-col class="graph-col" :span="4">
          <div id="gh3" v-bind:class="{ error : gh3Warning}" class="grid-content grid-status">
            <div>Greenhouse 3</div>
          </div>
        </el-col>
        <el-col class="graph-col" :span="4">
          <div id="outside" v-bind:class="{ error : outsideWarning}" class="grid-content grid-status">
            <div>Outdoor Beds</div>
          </div>
        </el-col>
        <el-col class="graph-col" :span="4">
          <div id="house" v-bind:class="{ error : houseWarning}" class="grid-content grid-status">
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
        object.datasets[0].data.push(reading || 0);
      });
      this.sensors.push(object);
      // if (data.data.id === 'gh1_plantzone_1_temp') {
        this.processData(object);
      // }
    },
    // Check sensor data against assignment brief specification
    // e.g Lettuce must be between 7 and 29 degrees
    processData(object) {
      // console.log(object.datasets[0].data);
      // GH1 Cactus Temperature
      if (object.key === 'gh1_plantzone_1_temp') {
        object.datasets[0].data.forEach((value, index) => {
          const timeStamp = this.createDate(object.labels[index]);
          if (this.isWinter(object.labels[index]) && this.isNight(object.labels[index])) {
            if (value < 8 || value > 10) {
              const notification = `[${timeStamp}] Warning: ${object.name} was at ${value}°C`;
              const description = 'In winter at night, temperature should be between 8 and 10°C'
              this.notifications.push({ index, notification, description });
              this.setStatus(object);
            }
          } else {  
            if (value < 7 || value > 29) {
              const notification = `[${timeStamp}] Warning: ${object.name} was at ${value}°C`;
              const description = 'Temperature should be between 7 and 29°C during the day'
              this.notifications.push({ index, notification, description });
              this.setStatus(object);
            }
          }
        });
      }
      // GH1 Cactus Light
      else if (object.key === 'gh1_plantzone_1_lux') {
        object.datasets[0].data.forEach((value, index) => {
          const timeStamp = this.createDate(object.labels[index]);
          if (value > 800) {
            const notification = `[${timeStamp}] Warning: ${object.name} was below 800 Lux`;
            this.notifications.push({ index, notification });
            this.setStatus(object);
          }          
        });
      }
      // GH1 Cactus Moisture
      else if (object.key === 'gh1_plantzone_1_moisture') {
        object.datasets[0].data.forEach((value, index) => {
          const timeStamp = this.createDate(object.labels[index]);
          if (value > 0.3) {
            const notification = `[${timeStamp}] Warning: ${object.name} was too moist(>30%)`;
            this.notifications.push({ index, notification });
            this.setStatus(object);
          }          
        });
      }
      // GH2 Lettuce Temperature
      
    },
    isNight(dateString) {
      const tempArray = dateString.split("T");
      const time = tempArray[1];
      const timeSplit = time.split(":");
      const hour = timeSplit[0];
      let isNight = false;
      
      if(hour > 16 || hour < 6) {
        isNight = true;
      }
      return isNight;
    },
    isWinter(dateString) {
      const tempArray = dateString.split("T");
      const date = tempArray[0];
      const dateSplit = date.split("-");
      const month = dateSplit[1];
      let isWinter = false;      
      if(month > 11 || month < 4) {
        isWinter = true;
      }
      return isWinter;
    },
    setStatus(object) {
      this.$myStore.state.sites.forEach((site) => {
        site.zones.forEach((zone) => {
          if (object.key.includes(`${site.id}_${zone.id}`)) {
            if (site.id === 'gh1') this.gh1Warning = true;
            else if (site.id === 'gh2') this.gh2Warning = true;
            else if (site.id === 'gh3') this.gh3Warning = true;
            else if (site.id === 'outside') this.outside = true;
            else if (site.id === 'house') this.houseWarning = true;
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
  background: #1e931e;
  color: #fff;
  box-shadow: 0 0 12px 4px #0080005c;
}
.grid-status.error {
  background: #eb9e05;
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
</style>
<style>
.el-card__body {
  max-height: 175px;
  overflow-y: auto;
}
</style>