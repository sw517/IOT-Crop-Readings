import Vue from 'vue'
import Router from 'vue-router'
import SensorReadings from '@/components/SensorReadings'
import SensorDetails from '@/components/SensorDetails'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'SensorReadings',
      component: SensorReadings
    },
    {
      path: '/:sensor',
      name: 'SensorDetails',
      component: SensorDetails
    }
  ]
})
