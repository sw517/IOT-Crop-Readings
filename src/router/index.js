import Vue from 'vue';
import Router from 'vue-router';
import SensorReadings from '@/components/SensorReadings';
import SensorListing from '@/components/SensorListing';
import SensorDetails from '@/components/SensorDetails';
import SiteDetails from '@/components/SiteDetails';
import SiteOverview from '@/components/SiteOverview';

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
      path: '/:site/overview',
      name: 'SiteOverview',
      component: SiteOverview,
    },
    {
      path: '/:site/:location',
      name: 'SensorListing',
      component: SensorListing,
    },
    {
      path: '/:site/:location/:sensor',
      name: 'SensorDetails',
      component: SensorDetails,
    },
  ],
});
