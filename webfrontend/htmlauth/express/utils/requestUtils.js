const directories = require('./directories')();
const fileHandler = require('./fileHandler');
const path = require('path');
const { Timeout, Unauthorized, TwoFactorCodeRequired } = require(path.resolve(directories.bin, './lib/errors'));

const configFile = `${directories.config}/unifi.json`;

const loginRequired = (config, changedConfig) => {
  const fields = ['ipaddress', 'username', 'password', 'port'];
  const changedFields = fields.filter((field) => changedConfig[field] !== undefined && changedConfig[field] !== config[field]);

  return changedFields.length > 0 || changedConfig.token || true === changedConfig.loginRequired;
};

const unifiRequestWithError = (config, executable) => async (req, res) => {
  try {
    await executable(req, res);
  } catch (e) {
    if (e instanceof TwoFactorCodeRequired || (e instanceof Unauthorized && req.body.token)) {
      config.twoFaEnabled = true;
      await fileHandler.writeJson(configFile, config);
      res.status(499);
      return res.end();
    } else if (e instanceof Unauthorized) {
      config.twoFaEnabled = false;
      await fileHandler.writeJson(configFile, config);
      res.status(403);
      return res.end();
    } else if (e instanceof Timeout) {
      res.status(408);
      return res.json({ error: { message: `Unifi Controller not reachable` } });
    }
    res.status(500);
    res.json({ error: e.message });
  }
};

module.exports = {
  loginRequired,
  unifiRequestWithError
};
