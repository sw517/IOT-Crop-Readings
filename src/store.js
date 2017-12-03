import Vue from 'vue';
import Vuex from 'vuex';
import API from './api';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    devices: [],
  },
  mutations: {
    FETCH_DEVICES(state, devices) {
      state.devices = devices;
    },
  },
  actions: {
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