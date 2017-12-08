<template>
    <weather 
        api-key="fcfefb32da5e585b808589366e32bc10"
        title="Weather"
        latitude="24.886436"
        longitude="91.880722"
        language="en"
        units="uk">
    </weather>
</template>
 
<script>
import VueWeatherWidget from 'vue-weather-widget';
import 'vue-weather-widget/dist/css/vue-weather-widget.css';
 
export default {
    components: {
        'weather': VueWeatherWidget
    },
}
</script> 