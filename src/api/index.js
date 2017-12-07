import axios from 'axios';

const API = {

  // A simple request to the API. Params are
  // added to the query string and a get
  // request is made using Axios.
  request(params) {
    const baseurl = 'http://shed.kent.ac.uk/';
    const queryString = `${baseurl}${params}`;
    return axios.get(queryString);
  },

  // Request all sites, using our base
  // request function.
  requestSites() {
    const queryString = 'sites';
    return this.request(queryString);
  },

  // Request all devices, using our base
  // request function.
  requestDevices() {
    const queryString = 'devices';
    return this.request(queryString);
  },

  // Request a specific device, with optional
  // params. Uses our base request function.
  requestDevice(params) {
    let queryString = 'device';
    queryString += this.formatParams(params);
    return this.request(queryString);
  },

  // Format our parameters so that they can
  // be passed into the URL. if sample_rate
  // is defined, we want to include that as
  // well.
  formatParams(params) {
    let queryString = `/${params.device_id}`;
    if (params.sample_rate) queryString += `/${params.sample_rate}`;
    return queryString;
  },

  requestWeather() {
    // API KEY: c995bf82a5ce1e9df10cfdeb6cee4430
    const baseurl = 'http://api.openweathermap.org/data/2.5/weather';
    const location = 'canterbury';
    const apiKey = 'c995bf82a5ce1e9df10cfdeb6cee4430';
    const queryString = `${baseurl}?q=${location}&APPID=${apiKey}`;
    console.log(queryString);
    return axios.get(queryString);
  },
};

export { API as default };
