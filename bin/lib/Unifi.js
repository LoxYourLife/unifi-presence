const _ = require('lodash');
const axios = require('axios');
const fs = require('fs');
const https = require('https');
const CookieParser = require('./CookieParser');
const errors = require('./errors');

const { LOGIN, DEVICES, HEALTH, SYSINFO, ACTIVE_CLIENTS, HISTORY_CLIENTS, EVENTS, SITES } = require('./urlTypes');

const wifiSignalPercentage = {
  '-1': 100,
  '-2': 100,
  '-3': 100,
  '-4': 100,
  '-5': 100,
  '-6': 100,
  '-7': 100,
  '-8': 100,
  '-9': 100,
  '-10': 100,
  '-11': 100,
  '-12': 100,
  '-13': 100,
  '-14': 100,
  '-15': 100,
  '-16': 100,
  '-17': 100,
  '-18': 100,
  '-19': 100,
  '-20': 100,
  '-21': 99,
  '-22': 99,
  '-23': 99,
  '-24': 98,
  '-25': 98,
  '-26': 98,
  '-51': 78,
  '-76': 38,
  '-27': 97,
  '-28': 97,
  '-29': 96,
  '-30': 96,
  '-31': 95,
  '-32': 95,
  '-33': 94,
  '-34': 93,
  '-35': 93,
  '-36': 92,
  '-37': 91,
  '-38': 90,
  '-39': 90,
  '-40': 89,
  '-41': 88,
  '-42': 87,
  '-43': 86,
  '-44': 85,
  '-45': 84,
  '-46': 83,
  '-47': 82,
  '-48': 81,
  '-49': 80,
  '-50': 79,
  '-52': 76,
  '-53': 75,
  '-54': 74,
  '-55': 73,
  '-56': 71,
  '-57': 70,
  '-58': 69,
  '-59': 67,
  '-60': 66,
  '-61': 64,
  '-62': 63,
  '-63': 61,
  '-64': 60,
  '-65': 58,
  '-66': 56,
  '-67': 55,
  '-68': 53,
  '-69': 51,
  '-70': 50,
  '-71': 48,
  '-72': 46,
  '-73': 44,
  '-74': 42,
  '-75': 40,
  '-77': 36,
  '-78': 34,
  '-79': 32,
  '-80': 30,
  '-81': 28,
  '-82': 26,
  '-83': 24,
  '-84': 22,
  '-85': 20,
  '-86': 17,
  '-87': 15,
  '-88': 13,
  '-89': 10,
  '-90': 8,
  '-91': 6,
  '-92': 3,
  '-93': 1,
  '-94': 1,
  '-95': 1,
  '-96': 1,
  '-97': 1,
  '-98': 1,
  '-99': 1,
  '-100': 1
};
const convertClient = (client) => {
  const data = {
    name: client.display_name || client.name || client.oui || 'unbekannt',
    mac: client.mac,
    type: client.type,
    userId: client.user_id,
    ip: client.ip,
    experience: client.wifi_experience_score,
    ssid: client.essid
  };
  if (client.type === 'WIRELESS') {
    if (client.signal) {
      data.signalDbm = client.signal;
      data.signalPercentage = wifiSignalPercentage[client.signal];
    } else {
      data.signalDbm = -100;
      data.signalPercentage = 0;
    }
  } else {
    data.signalPercentage = 0;
  }
  return data;
};

const convertDevice = (device) => ({
  name: device.name,
  mac: device.mac
});

const doAndHandleError = async (continuation) => {
  try {
    const data = await continuation();
    return data;
  } catch (e) {
    if (_.get(e, 'response.status', 0) === 401) {
      throw new errors.Unauthorized(JSON.stringify(e.response.data));
    }
    if (e.message.indexOf('timeout') !== -1 || e.message.indexOf('EHOSTDOWN') !== -1) {
      throw new errors.Timeout(e.message);
    }
    throw e;
  }
};

module.exports = class UniFi {
  constructor({ config, directories }) {
    this.setConfig(config);

    this.directories = directories;

    this.cookieParser = new CookieParser(directories);
    this.userFile = `${directories.data}/unifi.user.json`;
    this.axios = axios.create({
      httpsAgent: new https.Agent({
        rejectUnauthorized: false
      }),
      timeout: 3000
    });

    this.devices = null;
  }

  async setup() {
    return this.cookieParser.load();
  }

  setConfig(config) {
    this.config = config;

    if (_.isUndefined(this.config.native)) {
      this.config.native = true;
    }
    if (_.isUndefined(this.config.port)) {
      this.config.port = null;
    }
  }

  getUrl(type) {
    const isPort = !_.isNil(this.config.port);
    const isNative = this.config.native == true;
    const port = !isNative && isPort ? `:${this.config.port}` : '';
    const protocol = type === EVENTS ? 'wss://' : 'https://';
    const site = this.config.site || 'default';
    const url = protocol + this.config.ipaddress + port;

    const prefix = isNative && type !== LOGIN ? '/proxy/network' : '';

    switch (type) {
      case LOGIN:
        if (isNative) return `${url}/api/auth/login`;
        return `${url}/api/login`;
      case EVENTS:
        return `${url}${prefix}/wss/s/${site}/events?clients=v2`;
      case HEALTH:
        return `${url}${prefix}/api/s/${site}/stat/health`;
      case DEVICES:
        return `${url}${prefix}/api/s/${site}/stat/device`;
      case SYSINFO:
        return `${url}${prefix}/api/s/${site}/stat/sysinfo`;
      case ACTIVE_CLIENTS:
        return `${url}${prefix}/v2/api/site/${site}/clients/active`;
      case HISTORY_CLIENTS:
        return `${url}${prefix}/v2/api/site/${site}/clients/history?onlyNonBlocked=true&withinHours=24&withinHours=24`;
      case SITES:
        return `${url}${prefix}/api/self/sites`;
      default:
        return null;
    }
  }
  async login(token) {
    const data = {
      username: this.config.username,
      password: this.config.password,
      rememberMe: true
    };

    if (!this.config.native) {
      data.strict = true;
    }

    if (!_.isNil(token)) {
      if (this.config.native) {
        data.token = token;
      } else {
        data.ubic_2fa_token = token;
      }
    }

    const loginUrl = this.getUrl(LOGIN);
    try {
      const response = await this.axios.post(loginUrl, data, { timeout: 3000 });
      this.cookieParser.parseAndAdd(response.headers['set-cookie']);
      this.cookieParser.save();

      fs.writeFileSync(this.userFile, JSON.stringify(response.data));

      return true;
    } catch (e) {
      const twoFaRequired = !_.isUndefined(_.get(e, 'response.data.errors', []).find((text) => /2fa/gi.test(text)));
      const twoFaRequiredOld = _.get(e, 'response.data.meta.msg', '') == 'api.err.Ubic2faTokenRequired';
      if (_.get(e, 'response.status') === 499 || twoFaRequired || twoFaRequiredOld) {
        throw new errors.TwoFactorCodeRequired();
      }
      if (e.message.indexOf('timeout') !== -1 || e.message.indexOf('EHOSTDOWN') !== -1) {
        throw new errors.Timeout(e.message);
      }

      this.cookieParser.reset();
      fs.writeFileSync(this.userFile, JSON.stringify({}));

      throw new errors.Unauthorized(JSON.stringify(e.response.data));
    }
  }

  async health() {
    const url = this.getUrl(HEALTH);
    return doAndHandleError(async () => {
      const response = await this.axios.get(url, { headers: { cookie: this.cookieParser.serialize() } });
      return response.data;
    });
  }

  async getVersion() {
    const url = this.getUrl(SYSINFO);
    return doAndHandleError(async () => {
      const response = await this.axios.get(url, { headers: { cookie: this.cookieParser.serialize() } });
      return _.get(response, 'data.data.0.version', 0);
    });
  }

  async getActiveClients() {
    return doAndHandleError(async () => {
      const activeUrl = this.getUrl(ACTIVE_CLIENTS);
      const activeResponse = await this.axios.get(activeUrl, { headers: { cookie: this.cookieParser.serialize() } });
      const historyUrl = this.getUrl(HISTORY_CLIENTS);
      const historyResponse = await this.axios.get(historyUrl, { headers: { cookie: this.cookieParser.serialize() } });
      return [...activeResponse.data, ...historyResponse.data].map(convertClient);
    });
  }

  async getDevices() {
    return doAndHandleError(async () => {
      const deviceUrl = this.getUrl(DEVICES);
      const response = await this.axios.get(deviceUrl, { headers: { cookie: this.cookieParser.serialize() } });
      this.devices = response.data.data.map(convertDevice);
      return this.devices;
    });
  }

  async getAccessPoint(mac) {
    let forceLoad = true;
    if (this.devices === null) {
      await this.getDevices();
      forceLoad = false;
    }

    let device = _.find(this.devices, (d) => d.mac === mac);
    if (_.isNil(device) && forceLoad) {
      await this.getDevices();
      device = _.find(this.devices, (d) => d.mac === mac);
    }

    return device;
  }

  async getSites() {
    return doAndHandleError(async () => {
      const siteUrl = this.getUrl(SITES);
      const response = await this.axios.get(siteUrl, { headers: { cookie: this.cookieParser.serialize() } });
      this.sites = response.data.data.map((site) => ({ value: site.name, label: site.desc }));
      return this.sites;
    });
  }
};
