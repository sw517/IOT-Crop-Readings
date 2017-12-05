import Vue from 'vue';
import Vuex from 'vuex';
import API from './api';
import storage from './helpers/storage';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    sites: [],
    devices: [],
    zones: {},
    // Define our data types so that we
    // can grab data from each object
    // without having to worry about the
    // key name.
    dataTypes: {
      gas: {
        unit: 'gas_scale',
        values: 'gas_values',
      },
      hydrometer: {
        unit: null,
        values: 'moisture_value',
      },
      lumosity: {
        unit: null,
        values: 'light_value',
      },
      solar: {
        unit: 'solar_scale',
        values: 'solar_value',
      },
      tempHumid: {
        unit: null,
        values: 'humidity_value',
      },
    },
  },
  mutations: {
    // Set sites property to our fetched data.
    FETCH_SITES(state, sites) {
      state.sites = sites;
    },
    // Set sites property to our fetched data.
    FETCH_DEVICES(state, devices) {
      state.devices = devices;
    },
    // Set zones property to our fetched data.
    FETCH_ZONES(state, zones) {
      state.zones = zones;
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
    fetchDevices({ commit }) {
      // Check if devices are in storage first.
      // If it exists, grab that rather than
      // making a new API request.
      const inStorage = storage.get('devices');
      if (inStorage) {
        commit('FETCH_DEVICES', inStorage);
        return;
      }
      // Make request and run mutation that
      // adds our data to the store
      API.requestDevices()
        .then((response) => {
          commit('FETCH_DEVICES', response.data);
          storage.set('devices', response.data);
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
      const sensors = {};
      this.state.devices.forEach((type) => {
        type.sensorTypes.forEach((sensor) => {
          sensors[sensor] = [];
        });
      });
      const locations = {};
      this.state.sites.forEach((site) => {
        const prefix = `${site.id}_`;
        site.zones.forEach((zone) => {
          locations[prefix + zone.id] = [];
          sensors.sensorNames.forEach((sensor) => {
            if (sensor.includes(prefix + zone.id)) {
              locations[prefix + zone.id] += sensor;
            }
          });
        });
        commit('FETCH_ZONES', locations);
      });
    },
  },
});
