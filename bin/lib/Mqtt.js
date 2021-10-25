const dgram = require('dgram');
const _ = require('lodash');

module.exports = class Mqtt {
  constructor(globalConfig) {
    this.config = _.get(globalConfig, 'Mqtt', null);
  }

  connect() {
    this.client = dgram.createSocket('udp4');
  }
  send(topic, message) {
    if (_.isNil(this.config)) return;

    try {
      this.client.send(`${topic} ${message}`, this.config.Udpinport, 'localhost', () => {});
    } catch {
      this.connect();
    }
  }
};
