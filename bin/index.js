const UniFiSocket = require('./lib/UniFiSocket');
const Mqtt = require('./lib/Mqtt');
const fs = require('fs');
const ws = require('ws');
const directories = require('./lib/directories');
const { Unauthorized, TwoFactorCodeRequired, Disconnected } = require('./lib/errors');

const configFile = `${directories.config}/unifi.json`;
const cookieFile = `${directories.data}/unifi.cookies.json`;
let config = require(configFile);
const globalConfig = require(`${directories.homedir}/config/system/general.json`);

const states = {
  WAIT_FOR_CONFIG: 'WAIT_FOR_CONFIG',
  CONNECTED: 'CONNECTED',
  DISCONNECTED: 'DISCONNECTED',
  UNAUTHORIZED: 'UNAUTHORIZED'
};
let socket, pingInterval;
let currentState = states.DISCONNECTED;
let restart = false;

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
const waitForConfigChange = async () => {
  console.log('wait for config change');
  return new Promise((resolve) => fs.watch(configFile, { persistent: false }, resolve));
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
    await uniFi.getVersion();
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
    sendStatus(states.WAIT_FOR_CONFIG);
    return waitForConfigChange();
  }
};

const openSocket = () => {
  try {
    socket = new ws.WebSocket('ws://localhost:3000/plugins/unifi_presence/api/socket');
  } catch (error) {
    console.log('WS Error reconnecting in 5s', error);
    setTimeout(openSocket, 5000);
    return;
  }
  pingInterval = setInterval(() => socket.ping, 20000);
  socket.on('open', () => sendStatus(currentState));
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
    onClose();
  });

  uniFi.setSocket(socket);
};

const eventLoop = async () => {
  openSocket();
  await listenToEvents();
  if (!restart) await eventLoop();
};

eventLoop();
