import Vue from 'vue';
import Vuex from 'vuex';
import API from './api';
import storage from './helpers/storage';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    devices: [],
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
    FETCH_SITES(state, sites) {
      state.sites = sites;
    },
    FETCH_DEVICES(state, devices) {
      state.devices = devices;
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
      API.requestDevices()
        .then((response) => {
          commit('FETCH_DEVICES', response.data);
        })
        .catch(((error) => {
          /* eslint no-console: 0 */
          console.log(error.statusText);
        }));
    },
  },
});
