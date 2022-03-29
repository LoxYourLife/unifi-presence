const UniFi = require('./Unifi');
const _ = require('lodash');
const ws = require('ws');
const errors = require('./errors');
const { EVENTS } = require('./urlTypes');

module.exports = class UniFiSocket extends UniFi {
  constructor({ config, directories, mqtt }) {
    super({ config, directories });
    this.mqtt = mqtt;
    this.externalSocket = null;
    this.pingTimeout = null;
    this.pingInterval = null;
    this.stop = false;
  }
  setSocket(socket) {
    this.externalSocket = socket;
  }
  setConfig(config) {
    if (
      this.config &&
      (this.config.ipaddress !== config.ipaddress || this.config.username !== config.username || this.config.password !== config.password)
    ) {
      if (this.socket) this.socket.terminate();
    }
    super.setConfig(config);
  }

  openClientEvents() {
    return new Promise((resolve, reject) => {
      const url = this.getUrl(EVENTS);
      try {
        this.socket = new ws.WebSocket(url, {
          headers: { cookie: this.cookieParser.serialize() },
          rejectUnauthorized: false
        });
      } catch (e) {
        return reject(e);
      }
      this.pingInterval = setInterval(() => this.socket.send('ping'), 20000);
      this.socket.on('message', this.handleMessage.bind(this));
      const onClose = (error) => {
        console.log('Socket connection closed', error);
        clearTimeout(this.pingTimeout);
        clearInterval(this.pingInterval);
        this.pingInterval = null;
        this.pingTimeout = null;
        this.socket = null;
        if (this.error) return resolve();
        reject(new errors.Disconnected('Connection to socket lost'));
      };
      this.socket.on('error', onClose);
      this.socket.on('close', onClose);
    });
  }

  handleMessage(message) {
    clearTimeout(this.pingTimeout);
    this.pingTimeout = setTimeout(() => {
      console.log('no ping received');
      this.socket.terminate();
    }, 30000 + 1000);

    if (message.toString() === 'pong') return;

    const clients = new Map(this.config.clients.map((client) => [client.mac, client]));

    try {
      const event = JSON.parse(message.toString());
      const data = event.data;

      if (event.meta.message === 'device:sync') {
        return this.deviceSync(data);
      }

      const relevantDevices = data.filter((client) => clients.has(client.mac) || clients.has(client.user));

      if (_.isEmpty(relevantDevices)) return;

      switch (event.meta.message) {
        case 'client:sync':
          return this.syncMessage(clients, relevantDevices);
        case 'events':
          return this.eventMessage(clients, relevantDevices);
        default:
          console.log('unhandled event', event);
          return;
      }
    } catch {
      console.log(`Error with Event Message: ${message}`);
      return;
    }
  }

  async syncMessage(clients, relevantDevices) {
    await relevantDevices.forEach(async (event) => {
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

  async eventMessage(clients, relevantDevices) {
    await relevantDevices.forEach(async (event) => {
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

  async deviceSync(eventData) {
    eventData.forEach((data) => {
      if (data.lan_ip !== this.config.ipaddress) return;
      const event = {
        type: 'stats',
        data: {
          wan: {
            name: _.get(data, 'name', ''),
            status: _.get(data, 'status', ''),
            stats: _.get(data, 'system-stats', '')
          },
          www: {
            isp: _.get(data, 'geo_info.WAN.isp_name', ''),
            uptime: _.get(data, 'uplink.uptime')
          }
        }
      };

      if (this.externalSocket) {
        this.externalSocket.send(JSON.stringify(event));
      }
    });
  }

  send(client) {
    const name = client.name.replace(/[^a-z0-9]+/gi, '-');
    console.log(`Send status update for device: ${client.name}`);
    this.mqtt.send(`${this.config.topic}/${name}`, JSON.stringify(client));
  }
};
