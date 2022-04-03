const directories = require('../utils/directories')();
const path = require('path');
const fileHandler = require('../utils/fileHandler');
const requestUtils = require('../utils/requestUtils');
const UniFi = require(path.resolve(directories.bin, './lib/Unifi.js'));
const { exec } = require('child_process');
const configFile = `${directories.config}/unifi.json`;
const subscriptionFile = `${directories.config}/mqtt_subscriptions.cfg`;
let config = require(configFile);

const uniFi = new UniFi({ config, directories });

const index = async (req, res) => res.render('index', { title: 'Unifi Presence' });

const getConfig = (req, res) => res.json(config);

const saveConfig = requestUtils.unifiRequestWithError(config, async (req, res) => {
  const loginRequired = requestUtils.loginRequired(config, req.body);
  let token = null;
  if (req.body.token) {
    token = req.body.token;
  }

  const hasMqttTopicChanged = !!(req.body.topic !== config.topic);
  config = Object.assign(config, req.body);
  delete config.loginRequired;
  delete config.token;

  await fileHandler.writeJson(configFile, config);
  uniFi.setConfig(config);

  if (hasMqttTopicChanged) {
    await fileHandler.write(subscriptionFile, `${config.topic}/#`);
  }

  if (loginRequired) await uniFi.login(token);

  res.json(config);
});

const getStats = (_) =>
  requestUtils.unifiRequestWithError(config, async (req, res) => {
    const { version, deviceType } = await uniFi.getSysinfo();
    if (version < '6.4.54') {
      return res.json({ version, versionError: true });
    }
    const health = await uniFi.health();
    const healthData = _.get(health, 'data', []);
    const www = _.find(healthData, (d) => _.get(d, 'subsystem', '') === 'www');
    const wan = _.find(healthData, (d) => _.get(d, 'subsystem', '') === 'wan');

    res.json({
      version,
      versionError: false,
      deviceType,
      wan: {
        name: _.get(wan, 'gw_name', ''),
        status: _.get(wan, 'status', ''),
        stats: _.get(wan, 'gw_system-stats', '')
      },
      www: {
        isp: _.get(wan, 'isp_name', ''),
        uptime: _.get(www, 'uptime')
      }
    });
  });

const getClients = requestUtils.unifiRequestWithError(config, async (req, res) => {
  const clients = await uniFi.getActiveClients();
  res.json({ clients });
});

const getSites = requestUtils.unifiRequestWithError(config, async (req, res) => {
  const sites = await uniFi.getSites();
  res.json({ sites });
});

const restartService = async (req, res) => {
  const prom = new Promise((resolve, reject) => {
    exec(`npm --prefix ${directories.bin} restart`, (error) => {
      if (error) reject(error);
      else resolve();
    });
  });
  try {
    await prom;
    res.status(205);
    res.end();
  } catch {
    res.status(500);
    res.json({ error: { message: 'restarting the service failed' } });
  }
};

module.exports = {
  index,
  getClients,
  getConfig,
  saveConfig,
  getStats,
  getSites,
  restartService
};
