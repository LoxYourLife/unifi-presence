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
  ssid: client.essid,
  channel: client.channel
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
  }

  async login() {
    const loginUrl = `https://${this.config.ipaddress}/api/auth/login`;
    try {
      const response = await this.axios.post(loginUrl, {
        username: this.config.username,
        password: this.config.password,
        rememberMe: true
      });

      this.cookieParser.parseAndAdd(response.headers['set-cookie']);
      this.cookieParser.save();

      fs.writeFileSync(this.userFile, JSON.stringify(response.data));

      return true;
    } catch {
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

  async getActiveClients() {
    try {
      const activeUrl = `https://${this.config.ipaddress}/proxy/network/v2/api/site/default/clients/active`;
      const activeResponse = await this.axios.get(activeUrl, { headers: { cookie: this.cookieParser.serialize() } });
      const historyUrl = `https://${this.config.ipaddress}/proxy/network/v2/api/site/default/clients/history?onlyNonBlocked=true&withinHours=24&withinHours=24`;
      const historyResponse = await this.axios.get(historyUrl, { headers: { cookie: this.cookieParser.serialize() } });

      return [...activeResponse.data, ...historyResponse.data].map(convertClient);
    } catch (e) {
      return [];
    }
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
          return;
      }
    };
  }

  syncMessage(clients, relevantDevices) {
    relevantDevices.forEach((event) => {
      const client = clients.get(event.mac);
      const cloned = _.clone(client);

      client.ssid = event.essid;
      client.channel = event.channel;
      client.ip = event.ip;
      client.experience = event.wifi_experience_score;
      client.connected = !client.connected ? true : client.connected;

      if (!_.isEqual(client, cloned)) this.send(client);
    });
  }

  eventMessage(clients, relevantDevices) {
    relevantDevices.forEach((event) => {
      const client = clients.get(event.user);

      const ssid = client.ssid;
      const connected = client.connected;

      client.ssid = event.ssid;
      if (event.key === 'EVT_WU_Connected' && !client.connected) {
        client.connected = true;
      } else if (event.key === 'EVT_WU_Disconnected' && client.connected) {
        client.connected = false;
      }

      if (client.connected !== connected || ssid !== client.ssid) this.send(client);
    });
  }

  send(client) {
    const name = client.name.replace(/[^a-z0-9]+/gi, '-');
    this.mqtt.send(`UniFi/clients/${name}`, JSON.stringify(client));
  }
};
