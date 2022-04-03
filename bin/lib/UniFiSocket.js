const UniFi = require('./Unifi');
const _ = require('lodash');
const ws = require('ws');
const errors = require('./errors');
const wifiSignalPercentage = require('./signalPercentages');
const { EVENTS } = require('./urlTypes');

const convertClients = (clients) => new Map(clients.map((client) => [client.mac, client]));

const wiredClients = (clients, existing) => {
  const mapList = clients
    .filter((client) => client.type === 'WIRED')
    .map((client) => {
      if (existing.has(client.mac)) {
        return [client.mac, existing.get(client.mac)];
      }

      const enhancedClient = Object.assign(
        {
          lastChanged: new Date(),
          rxBytes: 0
        },
        client
      );
      return [client.mac, enhancedClient];
    });
  return new Map(mapList);
};
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

    this.clients = convertClients(this.config.clients);
    this.wired = wiredClients(this.config.clients, this.wired || new Map());
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

    try {
      const event = JSON.parse(message.toString());
      const data = event.data;

      if (event.meta.message === 'device:sync') {
        return this.deviceSync(data);
      }

      const relevantDevices = data.filter((client) => this.clients.has(client.mac) || this.clients.has(client.user));

      if (_.isEmpty(relevantDevices)) return;
      //console.log(relevantDevices, event.meta.message);
      switch (event.meta.message) {
        case 'client:sync':
        case 'sta:sync':
          return this.syncMessage(relevantDevices);
        case 'events':
          return this.eventMessage(relevantDevices);
        default:
          console.log('unhandled event', event);
          return;
      }
    } catch {
      console.log(`Error with Event Message: ${message}`);
      return;
    }
  }

  async syncMessage(relevantDevices) {
    await relevantDevices.forEach(async (event) => {
      const isWireless = event.type === 'WIRELESS';
      const client = this.clients.get(event.mac);
      const cloned = _.clone(client);
      const wiredTimeout = (this.config.wiredTimeout || 30) * 1000;
      client.ap = await this.getAccessPoint(event.ap_mac || event.gw_mac);
      client.ip = event.ip;

      if (isWireless) {
        client.ssid = event.essid;
        client.experience = event.wifi_experience_score;
        client.connected = !client.connected ? true : client.connected;

        if (event.signal && client.connected) {
          client.signalDbm = event.signal;
          client.signalPercentage = wifiSignalPercentage[event.signal];
        } else {
          client.signalDbm = -100;
          client.signalPercentage = 0;
        }
      } else {
        const wiredClient = this.wired.get(event.mac);
        if (wiredClient.rxBytes !== event.rx_bytes) {
          wiredClient.rxBytes = event.rx_bytes;
          wiredClient.lastChanged = new Date();
          this.wired.set(event.mac, wiredClient);

          client.connected = true;
        } else if (new Date() - wiredClient.lastChanged > wiredTimeout) {
          client.connected = false;
        }
      }

      if (!_.isEqual(client, cloned)) {
        this.send(client);
        this.clients.set(event.mac, client);
      }
    });
  }

  async eventMessage(relevantDevices) {
    await relevantDevices.forEach(async (event) => {
      const client = this.clients.get(event.user);
      const cloned = _.clone(client);

      if (event.key === ['EVT_WU_Connected', 'EVT_LU_Connected'].includes(event.key)) {
        client.connected = true;
        if (client.type === 'WIRELESS') {
          client.ssid = event.ssid;
          client.ap = await this.getAccessPoint(event.ap);
        }
      } else if (event.key === 'EVT_WU_Disconnected') {
        client.connected = false;
        client.signalDbm = -100;
        client.signalPercentage = 0;
        client.ssid = null;
      }

      if (!_.isEqual(client, cloned)) {
        this.send(client);
        this.clients.set(client.mac, client);
      }
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

      if (this.externalSocket && this.externalSocket.readyState === ws.OPEN) {
        this.externalSocket.send(JSON.stringify(event));
      }
    });
  }

  send(client) {
    const name = client.name.replace(/[^a-z0-9]+/gi, '-');
    console.log(`Send status update for device: ${client.name}`);
    this.mqtt.send(`${this.config.topic}/${name}`, JSON.stringify(client));

    if (this.externalSocket && this.externalSocket.readyState === ws.OPEN) {
      this.externalSocket.send(JSON.stringify({ type: 'device:sync', data: client }));
    }
  }
};
