const Mqtt = require('../../../bin/lib/Mqtt');
const mqtt = require('../../../bin/node_modules/mqtt');
jest.mock('../../../bin/node_modules/mqtt');
describe('MQTT', () => {
  let config, mqttInstance, mqttClient;
  beforeEach(() => {
    config = {
      Mqtt: {
        Brokeruser: 'user',
        Brokerpass: 'password',
        Brokerhost: 'localhost',
        Brokerport: 7721
      }
    };
    mqttClient = {
      end: jest.fn().mockName('mqtt.end'),
      publish: jest.fn().mockName('mqtt.publish'),
      reconnect: jest.fn().mockName('mqtt.reconnect'),
      connected: true
    };
    mqtt.connect.mockReturnValue(mqttClient);
    mqttInstance = new Mqtt(config);
  });
  afterEach(() => {
    jest.resetAllMocks();
  });
  describe('constructor', () => {
    it('should set the config', () => {
      expect(mqttInstance.config).toEqual(config.Mqtt);
    });
    it('Throws error when MQTT config is missing', () => {
      expect(() => new Mqtt({})).toThrow(Error('Cant connect to MQTT. Configuration is missing'));
    });
    it('Throws error when BrokerHost is missing', () => {
      delete config.Mqtt.Brokerhost;
      expect(() => new Mqtt(config)).toThrow(Error('Cant connect to MQTT. Configuration is missing'));
    });
    it('Throws error when BrokerPort is missing', () => {
      delete config.Mqtt.Brokerport;
      expect(() => new Mqtt(config)).toThrow(Error('Cant connect to MQTT. Configuration is missing'));
    });
    it('Throws error when BrokerUser is missing', () => {
      delete config.Mqtt.Brokeruser;
      expect(() => new Mqtt(config)).toThrow(Error('Cant connect to MQTT. Configuration is missing'));
    });
    it('Throws error when BrokerPass is missing', () => {
      delete config.Mqtt.Brokerpass;
      expect(() => new Mqtt(config)).toThrow(Error('Cant connect to MQTT. Configuration is missing'));
    });
    it('directly connects to MQTT', () => {
      expect(mqtt.connect).toHaveBeenCalledWith('mqtt://localhost:7721', {
        clientId: 'UniFiPresence',
        password: 'password',
        username: 'user'
      });
    });
  });
  describe('connect', () => {
    it('connects again', () => {
      mqttInstance.connect();
      expect(mqtt.connect).toHaveBeenCalledWith('mqtt://localhost:7721', {
        clientId: 'UniFiPresence',
        password: 'password',
        username: 'user'
      });
      expect(mqtt.connect).toHaveBeenCalledTimes(2);
    });
    it('stores the connection', () => {
      mqttInstance.connect();
      expect(mqttInstance.client).toEqual(mqttClient);
    });
  });
  describe('disconnect', () => {
    it('disconnects', () => {
      mqttInstance.disconnect();
      expect(mqttClient.end).toHaveBeenCalled();
    });
    it('disconnects only once', () => {
      mqttInstance.disconnect();
      mqttClient.connected = false;
      mqttInstance.disconnect();
      expect(mqttClient.end).toHaveBeenCalledTimes(1);
    });
  });
  describe('send', () => {
    it('does not send when the config is empty', () => {
      mqttInstance.config = null;
      mqttInstance.send('foo');
      expect(mqttClient.publish).not.toHaveBeenCalled();
    });
    it('reconnects when the client is disconnected', () => {
      mqttInstance.client.connected = false;
      mqttInstance.send('foo', 'message');
      expect(mqttClient.reconnect).toHaveBeenCalled();
      expect(mqttClient.publish).toHaveBeenCalledWith('foo', 'message');
    });
    it('sends the message', () => {
      mqttInstance.send('topic', 'the message');
      expect(mqttClient.reconnect).not.toHaveBeenCalled();
      expect(mqttClient.publish).toHaveBeenCalledWith('topic', 'the message');
    });
  });
});
