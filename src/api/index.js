import axios from 'axios';

const API = {
    request(params){
        const baseurl = 'http://shed.kent.ac.uk/';
        const querystring = `${baseurl}${params}`;
        return axios.get(querystring);
    },
    requestSites(){
        const querystring = 'sites';
        return this.request(querystring);
    },    
    requestDevices(){
        const querystring = 'devices';
        return this.request(querystring);
    },    
    requestDevice(params){
        let querystring = 'device';
        querystring += this.formatParams(params);
        return this.request(querystring);
    },
    formatParams(params){
        let querystring = `/${params.device_id}`;
        if (params.sample_rate) querystring += `/${params.sample_rate}`;
        return querystring;
    }
}

export {API as default};