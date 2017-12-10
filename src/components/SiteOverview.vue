<template>
  <div class="hello">
    <h1>Device Listing</h1>
    <h2>{{this.$route.params.location}}</h2>
    <!-- <div> All your devices will be prefixed with: {{$route.params.site}}_{{$route.params.location}}</div> -->
    <el-row :gutter="20">
      <el-col :span="24">
        <el-card class="box-card">
          <template>
            <el-table
              :data="sensors"
              align="left"
              width="33%"
              style="width: 100%">
              <el-table-column
                prop="name"
                label="Sensor"
                width="180">
              </el-table-column>
              <el-table-column
                prop="averageValue"
                label="Average value [last 12 hours]"
                width="180">
              </el-table-column>
              <el-table-column
                prop="currentValue"
                label="Current value">
              </el-table-column>
            </el-table>
          </template>
        </el-card>
      </el-col>
      
    </el-row>
  </div>
</template>

<script>
import API from '../api';
import LineChart from './LineChart';

export default {
  name: 'SiteOverview',
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
      let sensors = [];
      this.$myStore.state.sites.forEach((site) => {
        site.zones.forEach((zone) => {
          const locationString = `${site.id}_${zone.id}`;
          sensors = sensors.concat(this.$myStore.state.zones[locationString]);
        });
      });
      // eslint-disable-next-line
      for (let i = sensors.length - 1; i >= 0 ; i--) {
        const siteId = this.$route.params.site;
        if (!sensors[i].name.includes(siteId)) sensors.splice(i, 1);
      }
      return new Promise((resolve, reject) => {
        // eslint-disable-next-line
        for (const sensor of sensors) {
          API.requestDevice({
            device_id: sensor.name,
            sample_rate: 'hour',
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
        average: null,
        current: null,
        sampleRate: 'hour',
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
      const arrayLength = 12;
      // eslint-disable-next-line
      const updatedArray = data.data[values].slice(Math.max(data.data[values].length - arrayLength, 0));
      updatedArray.forEach(([time, reading]) => {
        if (reading == null) return; // Skip any null values
        const newTime = this.createDate(time);
        object.labels.push(newTime);
        object.datasets[0].data.push(reading || 0);
      });
      object.averageValue = `${this.averageValue(updatedArray)} ${data.data[unitKey]}`;
      object.currentValue = `${this.currentValue(updatedArray)} ${data.data[unitKey]}`;
      this.sensors.push(object);
      // HUMIDITY
      if (data.type === 'tempHumid') {
        const humScale = 'humidity_scale';
        const objectHum = {
          key: `${data.data.id}-hum`,
          name: `${data.data.name} - Humidity`,
          sampleRate: this.$myStore.state.dataTypes[data.type].sample_rate,
          average: null,
          current: null,
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
        // eslint-disable-next-line
        const updatedArray = data.data['humidity_value'].slice(Math.max(data.data['humidity_value'].length - arrayLength, 0));
        updatedArray.forEach(([time, reading]) => {
          if (reading == null) return; // Skip any null values
          const newTime = this.createDate(time);
          objectHum.labels.push(newTime);
          objectHum.datasets[0].data.push(reading || 0);
        });
        objectHum.averageValue = `${this.averageValue(updatedArray)} ${data.data[humScale]}`;
        objectHum.currentValue = `${this.currentValue(updatedArray)} ${data.data[humScale]}`;
        this.sensors.push(objectHum);
      }
    },
    averageValue(array) {
      let accum = 0;
      let tot = 0;
      // eslint-disable-next-line
      for (let i = 0; i < array.length; i++) {
        if (array[i][1] != null) {
          accum += array[i][1];
          tot += 1;
        }
      }
      return (accum / tot).toFixed(2);
    },
    currentValue(array) {
      if (array[array.length - 1][1] != null) {
        return array[array.length - 1][1].toFixed(2);
      }
      return 'Sensor returned null value. Ensure sensor is placed securely in relevant location';      
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
