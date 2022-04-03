let clients = [],
  server = null,
  lastStatus = null;

const onOpen = (isClient, ws, logger) => () => {
  if (isClient) {
    clients.push(ws);
    logger.debug('new client connection, send ' + lastStatus);
    if (lastStatus) ws.send(lastStatus);
  } else {
    server = ws;
  }
};

const onMessage = (isClient, ws, logger) => (message) => {
  const msg = message.toString();
  if (msg === 'ping') return ws.send('pong');

  if (isClient) {
    if (server) server.send(msg);
  } else {
    const event = JSON.parse(msg);
    if (event.type === 'serviceStatus') {
      logger.debug(`Got Server status ${msg}`);
      lastStatus = msg;
    }

    clients.forEach((client) => client.send(msg));
  }
};

const onClose = (isClient, ws) => () => {
  if (isClient) {
    clients = clients.filter((s) => s !== ws);
  } else {
    server = null;
    lastStatus = JSON.stringify({ type: 'serviceStatus', data: { status: 'LOST' } });
    clients.forEach((client) => client.send(lastStatus));
  }
};

const websocket = (_, logger) => (ws, request) => {
  const isClient = _.get(request, 'headers.sec-websocket-protocol', '') === 'webClient';

  ws.on('open', onOpen(isClient, ws, logger));
  ws.on('message', onMessage(isClient, ws, logger));
  ws.on('close', onClose(isClient, ws, logger));
};

module.exports = websocket;
