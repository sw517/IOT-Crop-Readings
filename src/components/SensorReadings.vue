<template>
  <div class="hello">
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
      <el-col class="graph-col" :span="12"
        v-for="site in this.$myStore.state.sites"
        :key="site.key"
      >
        <div class="grid-content grid-status">
          {{site.name}}
        </div>
      </el-col>
    </el-row>
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
    };
  },
  methods: {
    getDevices() {
      this.dataLoaded = false;
      const Mysensors = [];
      Object.keys(this.$myStore.state.sensors).forEach((type) => {
        console.log('type: ' + type);
        this.$myStore.state.sensors[type];
        console.log('array: '+ this.$myStore.state.sensors[type]);
        this.$myStore.state.sensors[type].forEach((sens) => {
          console.log('sens: '+ sens);
        });
      });
      console.log('sensors: ' + Mysensors);
      return new Promise((resolve, reject) => {
        // eslint-disable-next-line
        for (const sensor of Mysensors) {
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
  },
  watch: {
    $route() {
      this.getDevices();
    },
  },
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
  background: red;
}
</style>
