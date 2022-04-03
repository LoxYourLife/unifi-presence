const _ = require('lodash');
const UniFiSocket = require('./lib/UniFiSocket');
const Mqtt = require('./lib/Mqtt');
const fs = require('fs');
const ws = require('ws');
const directories = require('./lib/directories');
const { Unauthorized, TwoFactorCodeRequired, Disconnected } = require('./lib/errors');

const configFile = `${directories.config}/unifi.json`;
const cookieFile = `${directories.data}/unifi.cookies.json`;
const globalConfigFile = `${directories.homedir}/config/system/general.json`;

let config = require(configFile);
let globalConfig = require(globalConfigFile);

const states = {
  WAIT_FOR_CONFIG: 'WAIT_FOR_CONFIG',
  CONNECTED: 'CONNECTED',
  DISCONNECTED: 'DISCONNECTED',
  UNAUTHORIZED: 'UNAUTHORIZED',
  NO_MQTT: 'NO_MQTT'
};
let socket, pingInterval;
let currentState = states.DISCONNECTED;

const mqtt = new Mqtt(globalConfig);
const uniFi = new UniFiSocket({ config, directories, mqtt });
fs.watch(configFile, {}, () => {
  delete require.cache[require.resolve(configFile)];
  try {
    config = require(configFile);
    console.log('load new config');
    uniFi.setConfig(config);
  } catch {
    console.log('error while reading changed config');
  }
});

const waitForCookieChange = async () => {
  console.log('wait for cookie change');
  return new Promise((resolve) => fs.watch(cookieFile, { persistent: false }, resolve));
};
const waitForConfigChange = async (file) => {
  console.log(`wait for config change of ${file}`);
  return new Promise((resolve) => fs.watch(file, { persistent: false }, resolve));
};

const sendStatus = (status) => {
  currentState = status;
  if (socket && socket.readyState === ws.OPEN) {
    socket.send(
      JSON.stringify({
        type: 'serviceStatus',
        data: { status }
      })
    );
  }
};

const listenToEvents = async () => {
  console.log('start listening to events');
  try {
    await uniFi.setup();
    await uniFi.getSysinfo();
    sendStatus(states.CONNECTED);
    await uniFi.openClientEvents(config.clients);
  } catch (error) {
    if (error instanceof Unauthorized && !config.twoFaEnabled) {
      sendStatus(states.UNAUTHORIZED);
      try {
        const login = await uniFi.login();
        return login;
      } catch (loginError) {
        if (loginError instanceof TwoFactorCodeRequired) {
          return waitForCookieChange();
        }
      }
    } else if (error instanceof Unauthorized && config.twoFaEnabled) {
      sendStatus(states.UNAUTHORIZED);
      return waitForCookieChange();
    } else if (error instanceof Disconnected) {
      sendStatus(states.DISCONNECTED);
      console.log('Connection lost, retry in 5 seconds');
      return new Promise((resolve) => setTimeout(resolve, 5000));
    } else if (error.message.indexOf('ENETUNREACH') != -1) {
      sendStatus(states.DISCONNECTED);
      console.log('No Network, retry in 10 seconds');
      return new Promise((resolve) => setTimeout(resolve, 10000));
    }
    console.error(error);
    sendStatus(states.WAIT_FOR_CONFIG);
    return waitForConfigChange(configFile);
  }
};

const ping = () => {
  if (socket && socket.readyState === ws.OPEN) {
    socket.send('ping');
  }
};
const openSocket = () => {
  try {
    socket = new ws.WebSocket('ws://localhost:3300/plugins/unifi_presence/api/socket');
    console.log('WS connected');
  } catch (error) {
    console.log('WS Error reconnecting in 5s', error);
    socket = null;
    setTimeout(openSocket, 5000);
    return;
  }
  pingInterval = setInterval(ping, 20000);
  socket.on('open', () => {
    setTimeout(() => sendStatus(currentState), 1000);
  });
  socket.on('message', (message) => {
    if (message.toString() === 'pong') return;
    console.log('WS got message:', message.toString('Utf-8'));
  });

  const onClose = () => {
    clearInterval(pingInterval);
    socket = null;
    pingInterval = null;
    uniFi.setSocket(null);
    setTimeout(openSocket, 2000);
  };

  socket.on('close', () => {
    console.log('WS Disconnected');
    onClose();
  });
  socket.on('error', (error) => {
    console.log('Express socket returned error', error);
  });

  uniFi.setSocket(socket);
};

const hasMqttInstalled = async () => {
  if (_.get(globalConfig, 'Mqtt', null) === null) {
    sendStatus(states.NO_MQTT);
    await waitForConfigChange(globalConfigFile);
    delete require.cache[require.resolve(globalConfigFile)];
    globalConfig = require(globalConfigFile);
    return hasMqttInstalled();
  }
  mqtt.setConfig(globalConfig);
  mqtt.connect();
  return true;
};

const eventLoop = async () => {
  openSocket();
  await hasMqttInstalled();
  await listenToEvents();
  await eventLoop();
};

eventLoop();
