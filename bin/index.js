const _ = require('lodash');
const UniFi = require('./lib/Unifi');
const path = require('path');
const Mqtt = require('./lib/Mqtt');

const PRODUCTION = !process.argv.includes('--dev');
const directories = PRODUCTION
  ? {
      config: 'REPLACELBPCONFIGDIR',
      data: 'REPLACELBPDATADIR',
      homedir: process.env.LBHOMEDIR
    }
  : {
      config: path.join(__dirname, '../config'),
      data: path.join(__dirname, '../data'),
      homedir: path.join(__dirname, '../loxberry')
    };

const config = require(`${directories.config}/unifi.json`);
const globalConfig = require(`${directories.homedir}/config/system/general.json`);

const mqtt = new Mqtt(globalConfig);
const uniFi = new UniFi({ config, directories, mqtt });

const runWithValidSession = async (operation) => {
  const isSessionValid = await uniFi.health();
  if (!isSessionValid) {
    await uniFi.login();
  }

  await operation();
};

const listenToEvents = async () => {
  runWithValidSession(() => uniFi.openClientEvents(config.clients));
};

const login = async (token) => {
  console.log(await uniFi.login(token));
};

const getClients = () => {
  runWithValidSession(async () => {
    const clients = await uniFi.getActiveClients();
    console.log(JSON.stringify(clients));
  });
};

const isEmptyUser = _.isNil(config.username) || _.isEmpty(config.username);
const isEmptyPassword = _.isNil(config.password) || _.isEmpty(config.password);
const isEmptyIp = _.isNil(config.ipaddress) || _.isEmpty(config.ipaddress);

if (isEmptyIp || isEmptyPassword || isEmptyUser) {
  console.log('please configure the app first');
  process.exit(20);
}

if (process.argv.includes('clients')) {
  getClients();
} else if (process.argv.includes('login')) {
  const tokenArg = process.argv.find((arg) => /--token=([0-9]+)/i.test(arg));
  let token = null;
  if (!_.isUndefined(tokenArg)) {
    token = tokenArg.replace('--token=', '');
  }

  login(token);
} else if (process.argv.includes('events')) {
  listenToEvents();
} else {
  console.log('Error calling the script');
  console.log('');
  console.log('node index.js');
  console.log('options:');
  console.log('  --dev: run ins dev mode');
  console.log('commands:');
  console.log('  clients: fetches all active clients');
  console.log('  login: tries to login');
  console.log('  events: listens to UniFi events and forwards relvant data to MQTT');
  process.exit(21);
}
