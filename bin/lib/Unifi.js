const _ = require('lodash');
const axios = require('axios');
const fs = require('fs');
const https = require('https');
const CookieParser = require('./CookieParser');
const WebSocket = require('ws').WebSocket;

const convertClient = (client) => ({
  name: client.display_name || client.name || client.oui || 'unbekannt',
  mac: client.mac,
  type: client.type,
  userId: client.user_id,
  ip: client.ip,
  experience: client.wifi_experience_score,
  ssid: client.essid
});

const convertDevice = (device) => ({
  name: device.name,
  mac: device.mac
});

module.exports = class UniFi {
  constructor({ config, directories, mqtt }) {
    this.config = config;
    this.directories = directories;
    this.mqtt = mqtt;

    this.cookieParser = new CookieParser(directories);
    this.userFile = `${directories.data}/unifi.user.json`;
    this.axios = axios.create({
      httpsAgent: new https.Agent({
        rejectUnauthorized: false
      })
    });

    this.devices = null;
  }

  async login(token) {
    const data = {
      username: this.config.username,
      password: this.config.password,
      rememberMe: true
    };

    if (!_.isNil(token)) {
      data.token = token;
    }

    const loginUrl = `https://${this.config.ipaddress}/api/auth/login`;
    try {
      const response = await this.axios.post(loginUrl, data);

      this.cookieParser.parseAndAdd(response.headers['set-cookie']);
      this.cookieParser.save();

      fs.writeFileSync(this.userFile, JSON.stringify(response.data));

      return true;
    } catch (e) {
      const twoFaRequired = !_.isUndefined(_.get(e, 'response.data.errors', []).find((text) => /2fa/gi.test(text)));
      if (_.get(e, 'response, status') === 499 || twoFaRequired) {
        return '2FA';
      }

      this.cookieParser.reset();
      fs.writeFileSync(this.userFile, JSON.stringify({}));

      return false;
    }
  }

  async health() {
    const url = `https://${this.config.ipaddress}/proxy/network/api/s/default/stat/health`;
    try {
      const response = await this.axios.get(url, { headers: { cookie: this.cookieParser.serialize() } });
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }

  async getVersion() {
    const url = `https://${this.config.ipaddress}/proxy/network/api/s/default/stat/sysinfo`;
    try {
      const response = await this.axios.get(url, { headers: { cookie: this.cookieParser.serialize() } });
      return _.get(response, 'data.data.0.version', 0);
    } catch (e) {
      console.log(e.response);
      return 0;
    }
  }

  async getActiveClients() {
    try {
      const activeUrl = `https://${this.config.ipaddress}/proxy/network/v2/api/site/default/clients/active`;
      const activeResponse = await this.axios.get(activeUrl, { headers: { cookie: this.cookieParser.serialize() } });
      const historyUrl = `https://${this.config.ipaddress}/proxy/network/v2/api/site/default/clients/history?onlyNonBlocked=true&withinHours=24&withinHours=24`;
      const historyResponse = await this.axios.get(historyUrl, { headers: { cookie: this.cookieParser.serialize() } });

      return [...activeResponse.data, ...historyResponse.data].map(convertClient);
    } catch {
      return [];
    }
  }

  async getDevices() {
    try {
      const deviceUrl = `https://${this.config.ipaddress}/proxy/network/api/s/default/stat/device`;
      const response = await this.axios.get(deviceUrl, { headers: { cookie: this.cookieParser.serialize() } });
      this.devices = response.data.data.map(convertDevice);
      return this.devices;
    } catch (e) {
      return [];
    }
  }

  async getAccessPoint(mac) {
    if (this.devices === null) await this.getDevices();

    let device = _.find(this.devices, (d) => d.mac === mac);
    if (_.isNil(device)) {
      await this.getDevices();
      device = _.find(this.devices, (d) => d.mac === mac);
    }

    return device;
  }

  async openClientEvents(watchedClients) {
    const url = `wss://${this.config.ipaddress}/proxy/network/wss/s/default/events?clients=v2`;

    const ws = new WebSocket(url, {
      headers: { cookie: this.cookieParser.serialize() },
      rejectUnauthorized: false
    });

    const clients = new Map();
    watchedClients.forEach((client) => clients.set(client.mac, client));

    ws.on('message', this.handleMessage(clients));
    ws.on('close', (error) => {
      console.log('Disconnected');
      console.log(error);

      setTimeout(() => this.openClientEvents(watchedClients), 5000);
    });
  }

  handleMessage(clients) {
    return (message) => {
      const event = JSON.parse(message.toString());
      const data = event.data;
      const relevantDevices = data.filter((client) => clients.has(client.mac) || clients.has(client.user));

      if (_.isEmpty(relevantDevices)) return;

      switch (event.meta.message) {
        case 'client:sync':
          return this.syncMessage(clients, relevantDevices);
        case 'events':
          return this.eventMessage(clients, relevantDevices);
        default:
          console.log('unhadled event', event);
          return;
      }
    };
  }

  syncMessage(clients, relevantDevices) {
    relevantDevices.forEach(async (event) => {
      const client = clients.get(event.mac);
      const cloned = _.clone(client);

      client.ap = await this.getAccessPoint(event.ap_mac);
      client.ssid = event.essid;
      client.ip = event.ip;
      client.experience = event.wifi_experience_score;
      client.connected = !client.connected ? true : client.connected;

      if (!_.isEqual(client, cloned)) this.send(client);
    });
  }

  eventMessage(clients, relevantDevices) {
    relevantDevices.forEach(async (event) => {
      const client = clients.get(event.user);
      const cloned = _.clone(client);

      client.ssid = event.ssid;
      client.ap = await this.getAccessPoint(event.ap);

      if (event.key === 'EVT_WU_Connected') {
        client.connected = true;
      } else if (event.key === 'EVT_WU_Disconnected') {
        client.connected = false;
      }

      if (!_.isEqual(client, cloned)) this.send(client);
    });
  }

  send(client) {
    const name = client.name.replace(/[^a-z0-9]+/gi, '-');
    this.mqtt.send(`${this.config.topic}/${name}`, JSON.stringify(client));
  }
};
