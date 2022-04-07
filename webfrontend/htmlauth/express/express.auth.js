const path = require('path');

const http = require('./api/http');

module.exports = ({ router, expressStatic, _ }) => {
  router.use('/assets', expressStatic(path.resolve(__dirname, '../assets')));

  router.get('/', http.index);
  router.get('/clients', http.index);

  router.get('/api/config', http.getConfig);
  router.put('/api/config', http.saveConfig);
  router.get('/api/stats', http.getStats(_));
  router.get('/api/clients', http.getClients);
  router.get('/api/sites', http.getSites);
  router.post('/api/restartService', http.restartService);

  return router;
};
