// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import Vuex from 'vuex';
import ElementUI from 'element-ui';

import App from './App';
import router from './router';
import storePlugin from './storePlugin';

import './assets/element-variables.scss'; // third-party ui library -> http://element.eleme.io

Vue.use(storePlugin);
Vue.use(Vuex);
Vue.use(ElementUI);

Vue.config.productionTip = false;

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  template: '<App/>',
  components: { App },
});
