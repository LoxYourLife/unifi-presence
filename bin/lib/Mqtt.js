const mqtt = require('mqtt');
const _ = require('lodash');

module.exports = class Mqtt {
  constructor(globalConfig) {
    this.config = _.get(globalConfig, 'Mqtt', null);
    this.connect();
  }

  connect() {
    const connectUrl = `mqtt://${this.config.Brokerhost}:${this.config.Brokerport}`;
    this.client = mqtt.connect(connectUrl, {
      username: this.config.Brokeruser,
      password: this.config.Brokerpass,
      clientId: 'UniFiPresence'
    });
  }

  disconnect() {
    if (!this.client) return;
    this.client.end();
  }

  send(topic, message) {
    if (_.isNil(this.config)) return;

    if (!this.client.connected) this.client.reconnect();
    this.client.publish(topic, message);
  }
};
