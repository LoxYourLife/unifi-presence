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
    //
  }
});

const waitForCookieChange = async () => {
  return new Promise((resolve) => fs.watch(cookieFile, { persistent: false }, resolve));
};
const waitForConfigChange = async (file) => {
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
      return new Promise((resolve) => setTimeout(resolve, 5000));
    } else if (error.message.indexOf('ENETUNREACH') != -1) {
      sendStatus(states.DISCONNECTED);
      console.log('No Network, retry in 10 seconds');
      return new Promise((resolve) => setTimeout(resolve, 10000));
    }

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
    socket = new ws.WebSocket('ws://localhost/express/plugins/unifi_presence/api/socket');
  } catch (error) {
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
  });

  const onClose = () => {
    clearInterval(pingInterval);
    socket = null;
    pingInterval = null;
    uniFi.setSocket(null);
    setTimeout(openSocket, 2000);
  };

  socket.on('close', onClose);
  socket.on('error', () => {});

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
  await mqtt.connect();
  return true;
};


const eventLoop = async () => {
  await listenToEvents();
  await eventLoop();
};

const main = async () => {
  openSocket();
  await hasMqttInstalled();
  await eventLoop();
};

main();

