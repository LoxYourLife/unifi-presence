const UniFi = require('./lib/Unifi');
const path = require('path');
const Mqtt = require('./lib/Mqtt');

const PRODUCTION = !process.argv.includes('--dev');
const directories = PRODUCTION
  ? {
      config: 'REPLACELBPCONFIGDIR',
      data: 'REPLACELBPDATADIR'
    }
  : {
      config: path.join(__dirname, '../config'),
      data: path.join(__dirname, '../data')
    };

const config = require(`${directories.config}/unifi.json`);
const globalConfig = require(`${process.env.LBHOMEDIR}/config/system/general.json`);

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

const login = async () => {
  console.log(await uniFi.login());
};

const getClients = () => {
  runWithValidSession(async () => {
    const clients = await uniFi.getActiveClients();
    console.log(JSON.stringify(clients));
  });
};

if (process.argv.includes('clients')) {
  getClients();
} else if (process.argv.includes('login')) {
  login();
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
}
