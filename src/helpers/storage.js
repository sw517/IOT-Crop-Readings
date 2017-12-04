import { getDate } from '../helpers';

const storage = {
  // To add an object to localStorage, we
  // have to stringify it first.
  set(key, object) {
    const data = JSON.stringify(object);
    localStorage.setItem(key, data);
    this.setTimestamp(key);
  },

  // Check if value has expired. If not,
  // we retrieve our string, and parse it
  // so that we can actually do something
  // with the data.
  get(key) {
    if (this.keyIsExpired(key)) return false;
    const data = localStorage.getItem(key);
    const object = JSON.parse(data);
    return object;
  },

  // Set a timestamp for stored data. We
  // can use this as a date comparison to
  // check if our storage data is "too old".
  setTimestamp(key) {
    const unix = getDate(true);
    localStorage.setItem(`${key}Expiry`, unix);
  },

  // Compare our stored timestamp with the
  // current date. If it's more than our
  // expected range, we return true.
  compareTimestamp(storedUnix) {
    const unix = getDate(true);
    const expiry = 43200; // 12 hours
    let expired = false;
    if (parseInt(storedUnix, 10) + expiry < unix) expired = true;
    return expired;
  },

  // Check our stored unix time against the
  // current timestamp, and if it's expired
  // remove our localStorage data, and return
  // false.
  keyIsExpired(key) {
    const storedUnix = localStorage.getItem(`${key}Expiry`);
    const expired = this.compareTimestamp(storedUnix);
    if (!expired) return false;
    localStorage.removeItem(key);
    localStorage.removeItem(`${key}Expiry`);
    return true;
  },
};

export { storage as default };
