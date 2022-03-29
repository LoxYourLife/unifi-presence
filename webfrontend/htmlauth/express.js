const path = require('path');

const websocket = require('./api/socket');
const http = require('./api/http');

module.exports = ({ router, static, _ }) => {
  router.use('/assets', static(path.resolve(__dirname, 'assets')));

  router.get('/api/config', http.getConfig);
  router.put('/api/config', http.saveConfig);
  router.get('/api/stats', http.getStats(_));
  router.get('/api/clients', http.getClients);
  router.get('/api/sites', http.getSites);
  router.post('/api/restartService', http.restartService);

  router.ws('/api/socket', websocket(_));
  router.get('/*', http.index);
  return router;
};
