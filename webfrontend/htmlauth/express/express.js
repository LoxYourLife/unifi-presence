const websocket = require('./api/socket');

module.exports = ({ router, _, logger }) => {
  router.ws('/api/socket', websocket(_, logger));
  return router;
};
