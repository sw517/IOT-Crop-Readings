import Vue from 'vue';
import Vuex from 'vuex';
import API from './api';
import storage from './helpers/storage';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    sites: [],
    sensors: [],
    zones: {},
    // Define our data types so that we
    // can grab data from each object
    // without having to worry about the
    // key name.
    dataTypes: {
      gas: {
        unit: 'gas_scale',
        values: 'gas_values',
        sample_rate: 'minute',
        graphColor: '#333',
      },
      hydrometer: {
        unit: 'moisture_scale',
        values: 'moisture_value',
        sample_rate: 'hour',
        graphColor: '#559fcb',
      },
      lumosity: {
        unit: 'light_scale',
        values: 'light_value',
        sample_rate: '10minute',
        graphColor: '#d1cc21',
      },
      solar: {
        unit: 'solar_scale',
        values: 'solar_value',
        sample_rate: '10minute',
        graphColor: '#ffa824',
      },
      tempHumid: {
        unit: 'temp_scale',
        values: 'humidity_value',
        sample_rate: '10minute',
        graphColor: '#fc7976',
      },
    },
  },
  mutations: {
    // Set sites property to our fetched data.
    FETCH_SITES(state, sites) {
      state.sites = sites;
    },
    // Set zones property to our fetched data.
    FETCH_ZONES(state, zones) {
      state.zones = zones;
    },
    // Set sites property to our fetched data.
    FETCH_SENSORS(state, sensors) {
      state.sensors = sensors;
    },
  },
  actions: {
    fetchSites({ commit }) {
      // Check if sites are in storage first.
      // If it exists, grab that rather than
      // making a new API request.
      const inStorage = storage.get('sites');
      if (inStorage) {
        commit('FETCH_SITES', inStorage);
        return;
      }
      // Make request and run mutation that
      // adds our data to the store
      API.requestSites()
        .then((response) => {
          commit('FETCH_SITES', response.data);
          storage.set('sites', response.data);
        })
        .catch(((error) => {
          /* eslint no-console: 0 */
          console.log(error.statusText);
        }));
    },
    fetchSensors({ commit }) {
      // Check if devices are in storage first.
      // If it exists, grab that rather than
      // making a new API request.
      const inStorage = storage.get('sensors');
      if (inStorage) {
        commit('FETCH_SENSORS', inStorage);
        return;
      }
      // Make request and run mutation that
      // adds our data to the store
      API.requestDevices()
        .then((response) => {
          commit('FETCH_SENSORS', response.data);
          storage.set('sensors', response.data);
        })
        .catch(((error) => {
          /* eslint no-console: 0 */
          console.log(error.statusText);
        }));
    },
    groupData({ commit }) {
      // Check if devices are in storage first.
      // If it exists, grab that rather than
      // making a new API request.
      const inStorage = storage.get('zones');
      if (inStorage) {
        commit('FETCH_ZONES', inStorage);
        return;
      }

      const sensors = [];
      Object.keys(this.state.sensors).forEach((type) => {
        this.state.sensors[type].forEach((sensor) => {
          sensors.push({
            name: sensor,
            type,
          });
        });
      });

      const locations = {};
      this.state.sites.forEach((site) => {
        const prefix = `${site.id}_`;
        site.zones.forEach((zone) => {
          const locationID = prefix + zone.id;
          const reduced = sensors.reduce((accumulator, sensor) => {
            if (!sensor.name.includes(locationID)) return accumulator;
            return accumulator.concat(sensor);
          }, []);
          locations[locationID] = reduced;
        });
        commit('FETCH_ZONES', locations);
      });
    },
  },
});
