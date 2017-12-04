import Vue from 'vue';
import Router from 'vue-router';
import SensorReadings from '@/components/SensorReadings';
import SensorDetails from '@/components/SensorDetails';
import SiteDetails from '@/components/SiteDetails';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      name: 'SensorReadings',
      component: SensorReadings,
    },
    {
      path: '/:site',
      name: 'SiteDetails',
      component: SiteDetails,
    },
    {
      path: '/device/:sensor',
      name: 'SensorDetails',
      component: SensorDetails,
    },
  ],
});
