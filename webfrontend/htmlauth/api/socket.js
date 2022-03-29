let clients = [],
  server = null,
  lastStatus = null;

const onOpen = (isClient, ws) => () => {
  if (isClient) {
    clients.push(ws);
    if (lastStatus) ws.send(lastStatus);
  } else {
    server = ws;
  }
};

const onMessage = (isClient, ws) => (message) => {
  const msg = message.toString();
  if (msg === 'ping') return ws.pong();

  if (isClient) {
    if (server) server.send(msg);
  } else {
    const event = JSON.parse(msg);
    if (event.type === 'serviceStatus') {
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

const websocket = (_) => (ws, request) => {
  const isClient = _.get(request, 'headers.sec-websocket-protocol', '') === 'webClient';

  ws.on('open', onOpen(isClient, ws));
  ws.on('message', onMessage(isClient, ws));
  ws.on('close', onClose(isClient, ws));
};

module.exports = websocket;
