import store from './store';

export default {
  store,
  install(Vue) {
    Vue.prototype.$myStore = store;
  },
};
