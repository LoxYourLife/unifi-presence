const UniFi = require('../../../bin/lib/Unifi');
const CookieParser = require('../../../bin/lib/CookieParser');
const axios = require('../../../bin/node_modules/axios');
const fs = require('fs');
const https = require('https');
const nock = require('nock');
const ws = require('../../../bin/node_modules/ws');
jest.mock('../../../bin/lib/CookieParser');
jest.mock('fs');

describe('Unifi class', () => {
  let config, directories, mqtt, unifi;
  beforeEach(() => {
    nock.disableNetConnect();
    config = {
      username: 'foo@bar.de',
      password: 'password',
      ipaddress: '100.200.1.2',
      topic: 'UniFi/clients',
      native: true,
      port: null,
      clients: []
    };
    directories = {
      config: 'config',
      data: 'data',
      homedir: 'homedir'
    };
    mqtt = {
      send: jest.fn().mockName('mqtt.send').mockReturnValue()
    };
    jest.spyOn(axios, 'create');
    unifi = new UniFi({ config, directories, mqtt });
  });

  afterEach(() => {
    jest.clearAllMocks();
    CookieParser.mockClear();
  });

  describe('constructor', () => {
    it('should set the config', () => {
      expect(unifi.config).toEqual(config);
    });
    it('should set native to true if its undefined', () => {
      config.native = undefined;
      const unifi = new UniFi({ config, directories, mqtt });
      expect(unifi.config.native).toEqual(true);
    });
    it('should set native to true if its missing', () => {
      delete config.native;
      const unifi = new UniFi({ config, directories, mqtt });
      expect(unifi.config.native).toEqual(true);
    });
    it('should set port to null if its undefined', () => {
      config.port = undefined;
      const unifi = new UniFi({ config, directories, mqtt });
      expect(unifi.config.port).toBeNull();
    });
    it('should set port to null if its missing', () => {
      delete config.port;
      const unifi = new UniFi({ config, directories, mqtt });
      expect(unifi.config.port).toBeNull();
    });
    it('should initialize the cookieParser', () => {
      expect(CookieParser).toHaveBeenCalled();
    });
    it('should set the user file', () => {
      expect(unifi.userFile).toEqual('data/unifi.user.json');
    });
    it('should initialize axios', () => {
      jest.spyOn(https, 'Agent').mockImplementation(() => ({ agent: true }));
      unifi = new UniFi({ config, directories, mqtt });
      expect(axios.create).toHaveBeenCalledWith({ httpsAgent: { agent: true } });
    });
    it('should set devices to null', () => {
      expect(unifi.devices).toBeNull();
    });
  });
  describe('setup', () => {
    it('should load data from cookieParser', async () => {
      await expect(unifi.setup()).resolves.toBeUndefined();
    });
  });
  describe('get url', () => {
    describe('not native and with port', () => {
      beforeEach(() => {
        config.port = 6637;
        config.native = false;
        unifi = new UniFi({ config, directories, mqtt });
      });
      it('returns null on unknown type', () => {
        expect(unifi.getUrl()).toBeNull();
      });
      it('returns login url', () => {
        expect(unifi.getUrl('LOGIN')).toEqual('https://100.200.1.2:6637/api/login');
      });
      it('returns events url', () => {
        expect(unifi.getUrl('EVENTS')).toEqual('wss://100.200.1.2:6637/wss/s/default/events?clients=v2');
      });
      it('returns health url', () => {
        expect(unifi.getUrl('HEALTH')).toEqual('https://100.200.1.2:6637/api/s/default/stat/health');
      });
      it('returns devices url', () => {
        expect(unifi.getUrl('DEVICES')).toEqual('https://100.200.1.2:6637/api/s/default/stat/device');
      });
      it('returns sysinfo url', () => {
        expect(unifi.getUrl('SYSINFO')).toEqual('https://100.200.1.2:6637/api/s/default/stat/sysinfo');
      });
      it('returns active clients url', () => {
        expect(unifi.getUrl('ACTIVE_CLIENTS')).toEqual('https://100.200.1.2:6637/v2/api/site/default/clients/active');
      });
      it('returns history clients url', () => {
        expect(unifi.getUrl('HISTORY_CLIENTS')).toEqual(
          'https://100.200.1.2:6637/v2/api/site/default/clients/history?onlyNonBlocked=true&withinHours=24&withinHours=24'
        );
      });
    });
    describe('native with port', () => {
      beforeEach(() => {
        config.port = 6637;
        unifi = new UniFi({ config, directories, mqtt });
      });
      it('returns null on unknown type', () => {
        expect(unifi.getUrl()).toBeNull();
      });
      it('returns login url', () => {
        expect(unifi.getUrl('LOGIN')).toEqual('https://100.200.1.2/api/auth/login');
      });
      it('returns events url', () => {
        expect(unifi.getUrl('EVENTS')).toEqual('wss://100.200.1.2/proxy/network/wss/s/default/events?clients=v2');
      });
      it('returns health url', () => {
        expect(unifi.getUrl('HEALTH')).toEqual('https://100.200.1.2/proxy/network/api/s/default/stat/health');
      });
      it('returns devices url', () => {
        expect(unifi.getUrl('DEVICES')).toEqual('https://100.200.1.2/proxy/network/api/s/default/stat/device');
      });
      it('returns sysinfo url', () => {
        expect(unifi.getUrl('SYSINFO')).toEqual('https://100.200.1.2/proxy/network/api/s/default/stat/sysinfo');
      });
      it('returns active clients url', () => {
        expect(unifi.getUrl('ACTIVE_CLIENTS')).toEqual('https://100.200.1.2/proxy/network/v2/api/site/default/clients/active');
      });
      it('returns history clients url', () => {
        expect(unifi.getUrl('HISTORY_CLIENTS')).toEqual(
          'https://100.200.1.2/proxy/network/v2/api/site/default/clients/history?onlyNonBlocked=true&withinHours=24&withinHours=24'
        );
      });
    });
    describe('native without port', () => {
      it('returns null on unknown type', () => {
        expect(unifi.getUrl()).toBeNull();
      });
      it('returns login url', () => {
        expect(unifi.getUrl('LOGIN')).toEqual('https://100.200.1.2/api/auth/login');
      });
      it('returns events url', () => {
        expect(unifi.getUrl('EVENTS')).toEqual('wss://100.200.1.2/proxy/network/wss/s/default/events?clients=v2');
      });
      it('returns health url', () => {
        expect(unifi.getUrl('HEALTH')).toEqual('https://100.200.1.2/proxy/network/api/s/default/stat/health');
      });
      it('returns devices url', () => {
        expect(unifi.getUrl('DEVICES')).toEqual('https://100.200.1.2/proxy/network/api/s/default/stat/device');
      });
      it('returns sysinfo url', () => {
        expect(unifi.getUrl('SYSINFO')).toEqual('https://100.200.1.2/proxy/network/api/s/default/stat/sysinfo');
      });
      it('returns active clients url', () => {
        expect(unifi.getUrl('ACTIVE_CLIENTS')).toEqual('https://100.200.1.2/proxy/network/v2/api/site/default/clients/active');
      });
      it('returns history clients url', () => {
        expect(unifi.getUrl('HISTORY_CLIENTS')).toEqual(
          'https://100.200.1.2/proxy/network/v2/api/site/default/clients/history?onlyNonBlocked=true&withinHours=24&withinHours=24'
        );
      });
    });
  });
  describe('login', () => {
    it('authentication failes', async () => {
      nock('https://100.200.1.2')
        .post('/api/auth/login', { username: 'foo@bar.de', password: 'password', rememberMe: true })
        .reply(401, {});
      await expect(unifi.login()).resolves.toBeFalsy();
      expect(CookieParser.mock.instances[0].reset).toHaveBeenCalled();
      expect(fs.writeFileSync).toHaveBeenCalledWith('data/unifi.user.json', '{}');
    });
    it('authentication failes with two factor required', async () => {
      nock('https://100.200.1.2')
        .post('/api/auth/login', { username: 'foo@bar.de', password: 'password', rememberMe: true })
        .reply(401, { errors: ['2fa'] });
      await expect(unifi.login()).resolves.toBe('2FA');
      expect(CookieParser.mock.instances[0].reset).not.toHaveBeenCalled();
      expect(fs.writeFileSync).not.toHaveBeenCalled();
    });
    it('authentication failes with two factor required witht he old way', async () => {
      nock('https://100.200.1.2')
        .post('/api/auth/login', { username: 'foo@bar.de', password: 'password', rememberMe: true })
        .reply(401, { meta: { msg: 'api.err.Ubic2faTokenRequired' } });
      await expect(unifi.login()).resolves.toBe('2FA');
      expect(CookieParser.mock.instances[0].reset).not.toHaveBeenCalled();
      expect(fs.writeFileSync).not.toHaveBeenCalled();
    });
    it('authenticates and stores cookie', async () => {
      nock('https://100.200.1.2')
        .post('/api/auth/login', { username: 'foo@bar.de', password: 'password', rememberMe: true })
        .reply(200, { user: 'foo@bar.de' }, { 'set-cookie': 'cookie' });
      await expect(unifi.login()).resolves.toBeTruthy();
      expect(CookieParser.mock.instances[0].parseAndAdd).toHaveBeenCalledWith(['cookie']);
      expect(CookieParser.mock.instances[0].save).toHaveBeenCalled();
      expect(fs.writeFileSync).toHaveBeenCalledWith('data/unifi.user.json', '{"user":"foo@bar.de"}');
    });
    it('authenticates non native and stores cookie', async () => {
      config.native = false;
      unifi = new UniFi({ config, directories, mqtt });
      nock('https://100.200.1.2')
        .post('/api/login', { username: 'foo@bar.de', password: 'password', rememberMe: true, strict: true })
        .reply(200, { user: 'foo@bar.de' }, { 'set-cookie': 'cookie' });
      await expect(unifi.login()).resolves.toBeTruthy();
      expect(CookieParser.mock.instances[1].parseAndAdd).toHaveBeenCalledWith(['cookie']);
      expect(CookieParser.mock.instances[1].save).toHaveBeenCalled();
      expect(fs.writeFileSync).toHaveBeenCalledWith('data/unifi.user.json', '{"user":"foo@bar.de"}');
    });
    it('authenticates with token', async () => {
      nock('https://100.200.1.2')
        .post('/api/auth/login', { username: 'foo@bar.de', password: 'password', rememberMe: true, token: '2faToken' })
        .reply(200, { user: 'foo@bar.de' }, { 'set-cookie': 'cookie' });
      await expect(unifi.login('2faToken')).resolves.toBeTruthy();
      expect(CookieParser.mock.instances[0].parseAndAdd).toHaveBeenCalledWith(['cookie']);
      expect(CookieParser.mock.instances[0].save).toHaveBeenCalled();
      expect(fs.writeFileSync).toHaveBeenCalledWith('data/unifi.user.json', '{"user":"foo@bar.de"}');
    });
    it('authenticates non native with token', async () => {
      config.native = false;
      unifi = new UniFi({ config, directories, mqtt });
      nock('https://100.200.1.2')
        .post('/api/login', { username: 'foo@bar.de', password: 'password', rememberMe: true, strict: true, ubic_2fa_token: '2faToken' })
        .reply(200, { user: 'foo@bar.de' }, { 'set-cookie': 'cookie' });
      await expect(unifi.login('2faToken')).resolves.toBeTruthy();
      expect(CookieParser.mock.instances[1].parseAndAdd).toHaveBeenCalledWith(['cookie']);
      expect(CookieParser.mock.instances[1].save).toHaveBeenCalled();
      expect(fs.writeFileSync).toHaveBeenCalledWith('data/unifi.user.json', '{"user":"foo@bar.de"}');
    });
  });
  describe('health', () => {
    it('should return true if the status code is 200', async () => {
      CookieParser.mock.instances[0].serialize.mockReturnValue('foo=bar');
      nock('https://100.200.1.2', { cookie: 'foo=bar' }).get('/proxy/network/api/s/default/stat/health').reply(200, {});
      await expect(unifi.health()).resolves.toBeTruthy();
    });
    it('should return false if the status code is 201', async () => {
      CookieParser.mock.instances[0].serialize.mockReturnValue('foo=bar');
      nock('https://100.200.1.2', { cookie: 'foo=bar' }).get('/proxy/network/api/s/default/stat/health').reply(201, {});
      await expect(unifi.health()).resolves.toBeFalsy();
    });
    it('should return false if the status code is 400', async () => {
      CookieParser.mock.instances[0].serialize.mockReturnValue('foo=bar');
      nock('https://100.200.1.2', { cookie: 'foo=bar' }).get('/proxy/network/api/s/default/stat/health').reply(400, {});
      await expect(unifi.health()).resolves.toBeFalsy();
    });
  });
  describe('get version', () => {
    it('should return 0 in case of an error', async () => {
      CookieParser.mock.instances[0].serialize.mockReturnValue('foo=bar');
      nock('https://100.200.1.2', { cookie: 'foo=bar' }).get('/proxy/network/api/s/default/stat/sysinfo').reply(400, {});
      await expect(unifi.getVersion()).resolves.toEqual(0);
    });
    it('should return 0 when the date structure is wrong', async () => {
      CookieParser.mock.instances[0].serialize.mockReturnValue('foo=bar');
      nock('https://100.200.1.2', { cookie: 'foo=bar' }).get('/proxy/network/api/s/default/stat/sysinfo').reply(200, { version: 1 });
      await expect(unifi.getVersion()).resolves.toEqual(0);
    });
    it('should return the correct version', async () => {
      CookieParser.mock.instances[0].serialize.mockReturnValue('foo=bar');
      nock('https://100.200.1.2', { cookie: 'foo=bar' })
        .get('/proxy/network/api/s/default/stat/sysinfo')
        .reply(200, { data: [{ version: '7.8.6' }] });
      await expect(unifi.getVersion()).resolves.toEqual('7.8.6');
    });
  });
  describe('get active clients', () => {
    it('should return empty array when active clients request fails', async () => {
      CookieParser.mock.instances[0].serialize.mockReturnValue('foo=bar');
      nock('https://100.200.1.2', { cookie: 'foo=bar' }).get('/proxy/network/v2/api/site/default/clients/active').reply(400, {});
      await expect(unifi.getActiveClients()).resolves.toEqual([]);
    });
    it('should return empty array when history clients request fails', async () => {
      CookieParser.mock.instances[0].serialize.mockReturnValue('foo=bar');
      nock('https://100.200.1.2', { cookie: 'foo=bar' })
        .get('/proxy/network/v2/api/site/default/clients/active')
        .reply(200, [{ client: 'foo' }])
        .get('/proxy/network/v2/api/site/default/clients/history?onlyNonBlocked=true&withinHours=24&withinHours=24')
        .reply(400, {});
      await expect(unifi.getActiveClients()).resolves.toEqual([]);
    });
    it('should return empty array of active and history clients when responses are empty', async () => {
      CookieParser.mock.instances[0].serialize.mockReturnValue('foo=bar');
      nock('https://100.200.1.2', { cookie: 'foo=bar' })
        .get('/proxy/network/v2/api/site/default/clients/active')
        .reply(200, [])
        .get('/proxy/network/v2/api/site/default/clients/history?onlyNonBlocked=true&withinHours=24&withinHours=24')
        .reply(200, []);
      await expect(unifi.getActiveClients()).resolves.toEqual([]);
    });
    it('should return only active clients when history clients are empty', async () => {
      CookieParser.mock.instances[0].serialize.mockReturnValue('foo=bar');
      nock('https://100.200.1.2', { cookie: 'foo=bar' })
        .get('/proxy/network/v2/api/site/default/clients/active')
        .reply(200, [
          {
            display_name: 'foo',
            mac: 'mac',
            type: 'wifi',
            user_id: 'r657890',
            ip: '10.10.1.1',
            wifi_experience_score: 90,
            essid: 'essid'
          }
        ])
        .get('/proxy/network/v2/api/site/default/clients/history?onlyNonBlocked=true&withinHours=24&withinHours=24')
        .reply(200, []);
      await expect(unifi.getActiveClients()).resolves.toEqual([
        { name: 'foo', experience: 90, ip: '10.10.1.1', mac: 'mac', ssid: 'essid', type: 'wifi', userId: 'r657890' }
      ]);
    });
    it('should return only history clients when active clients are empty', async () => {
      CookieParser.mock.instances[0].serialize.mockReturnValue('foo=bar');
      nock('https://100.200.1.2', { cookie: 'foo=bar' })
        .get('/proxy/network/v2/api/site/default/clients/active')
        .reply(200, [])
        .get('/proxy/network/v2/api/site/default/clients/history?onlyNonBlocked=true&withinHours=24&withinHours=24')
        .reply(200, [
          {
            display_name: 'foo',
            mac: 'mac',
            type: 'wifi',
            user_id: 'r657890',
            ip: '10.10.1.1',
            wifi_experience_score: 90,
            essid: 'essid'
          }
        ]);
      await expect(unifi.getActiveClients()).resolves.toEqual([
        { name: 'foo', experience: 90, ip: '10.10.1.1', mac: 'mac', ssid: 'essid', type: 'wifi', userId: 'r657890' }
      ]);
    });
    it('should return merged array of active and history clients', async () => {
      CookieParser.mock.instances[0].serialize.mockReturnValue('foo=bar');
      nock('https://100.200.1.2', { cookie: 'foo=bar' })
        .get('/proxy/network/v2/api/site/default/clients/active')
        .reply(200, [
          {
            display_name: 'foo',
            mac: 'mac',
            type: 'wifi',
            user_id: 'r657890',
            ip: '10.10.1.1',
            wifi_experience_score: 90,
            essid: 'essid'
          }
        ])
        .get('/proxy/network/v2/api/site/default/clients/history?onlyNonBlocked=true&withinHours=24&withinHours=24')
        .reply(200, [
          {
            display_name: 'bar',
            mac: 'mac bar',
            type: 'wifi',
            user_id: 'rtuzioi',
            ip: '10.10.1.3',
            wifi_experience_score: 70,
            essid: 'essid 2'
          }
        ]);
      await expect(unifi.getActiveClients()).resolves.toEqual([
        { name: 'foo', experience: 90, ip: '10.10.1.1', mac: 'mac', ssid: 'essid', type: 'wifi', userId: 'r657890' },
        { name: 'bar', experience: 70, ip: '10.10.1.3', mac: 'mac bar', ssid: 'essid 2', type: 'wifi', userId: 'rtuzioi' }
      ]);
    });
    it('should return name from name', async () => {
      CookieParser.mock.instances[0].serialize.mockReturnValue('foo=bar');
      nock('https://100.200.1.2', { cookie: 'foo=bar' })
        .get('/proxy/network/v2/api/site/default/clients/active')
        .reply(200, [])
        .get('/proxy/network/v2/api/site/default/clients/history?onlyNonBlocked=true&withinHours=24&withinHours=24')
        .reply(200, [{ name: 'foo' }]);
      const clients = await unifi.getActiveClients();
      expect(clients[0].name).toEqual('foo');
    });
    it('should return name from oui', async () => {
      CookieParser.mock.instances[0].serialize.mockReturnValue('foo=bar');
      nock('https://100.200.1.2', { cookie: 'foo=bar' })
        .get('/proxy/network/v2/api/site/default/clients/active')
        .reply(200, [])
        .get('/proxy/network/v2/api/site/default/clients/history?onlyNonBlocked=true&withinHours=24&withinHours=24')
        .reply(200, [{ oui: 'oui name' }]);
      const clients = await unifi.getActiveClients();
      expect(clients[0].name).toEqual('oui name');
    });
    it('should use "unbekannt" as name when no field is present', async () => {
      CookieParser.mock.instances[0].serialize.mockReturnValue('foo=bar');
      nock('https://100.200.1.2', { cookie: 'foo=bar' })
        .get('/proxy/network/v2/api/site/default/clients/active')
        .reply(200, [])
        .get('/proxy/network/v2/api/site/default/clients/history?onlyNonBlocked=true&withinHours=24&withinHours=24')
        .reply(200, [{}]);
      const clients = await unifi.getActiveClients();
      expect(clients[0].name).toEqual('unbekannt');
    });
  });
  describe('get devices', () => {
    it('should return empty array when devices request fails', async () => {
      CookieParser.mock.instances[0].serialize.mockReturnValue('foo=bar');
      nock('https://100.200.1.2', { cookie: 'foo=bar' }).get('/proxy/network/api/s/default/stat/device').reply(400, {});
      await expect(unifi.getDevices()).resolves.toEqual([]);
      expect(unifi.devices).toEqual(null);
    });
    it('should return empty array of devices when request is empty', async () => {
      CookieParser.mock.instances[0].serialize.mockReturnValue('foo=bar');
      nock('https://100.200.1.2', { cookie: 'foo=bar' }).get('/proxy/network/api/s/default/stat/device').reply(200, { data: [] });
      await expect(unifi.getDevices()).resolves.toEqual([]);
      expect(unifi.devices).toEqual([]);
    });
    it('should return list of devices', async () => {
      CookieParser.mock.instances[0].serialize.mockReturnValue('foo=bar');
      nock('https://100.200.1.2', { cookie: 'foo=bar' })
        .get('/proxy/network/api/s/default/stat/device')
        .reply(200, {
          data: [
            { name: 'foo', mac: 'mac1' },
            { name: 'bar', mac: 'mac5' }
          ]
        });
      await expect(unifi.getDevices()).resolves.toEqual([
        { name: 'foo', mac: 'mac1' },
        { name: 'bar', mac: 'mac5' }
      ]);
      expect(unifi.devices).toEqual([
        { name: 'foo', mac: 'mac1' },
        { name: 'bar', mac: 'mac5' }
      ]);
    });
  });
  describe('get access points', () => {
    it('should return undefined when request fails', async () => {
      CookieParser.mock.instances[0].serialize.mockReturnValue('foo=bar');
      nock('https://100.200.1.2', { cookie: 'foo=bar' }).get('/proxy/network/api/s/default/stat/device').reply(400, {});
      await expect(unifi.getAccessPoint('mac')).resolves.toBeUndefined();
    });
    it('should return undefined when AP not in list', async () => {
      CookieParser.mock.instances[0].serialize.mockReturnValue('foo=bar');
      nock('https://100.200.1.2', { cookie: 'foo=bar' })
        .get('/proxy/network/api/s/default/stat/device')
        .reply(200, { data: [{ mac: 'bar' }] });
      await expect(unifi.getAccessPoint('mac')).resolves.toBeUndefined();
    });
    it('should return matching AP when mac euals', async () => {
      CookieParser.mock.instances[0].serialize.mockReturnValue('foo=bar');
      nock('https://100.200.1.2', { cookie: 'foo=bar' })
        .get('/proxy/network/api/s/default/stat/device')
        .reply(200, {
          data: [
            { name: 'bar', mac: 'bar' },
            { name: 'Mac', mac: 'mac' }
          ]
        });
      await expect(unifi.getAccessPoint('mac')).resolves.toEqual({ name: 'Mac', mac: 'mac' });
    });
    it('should not fetch devices when they are loaded and AP was found', async () => {
      unifi.devices = [
        { name: 'bar', mac: 'bar' },
        { name: 'Mac', mac: 'mac' }
      ];
      await expect(unifi.getAccessPoint('mac')).resolves.toEqual({ name: 'Mac', mac: 'mac' });
    });
    it('should fetch devices when the AP wasnt found in existing', async () => {
      unifi.devices = [{ name: 'Mac', mac: 'mac' }];
      CookieParser.mock.instances[0].serialize.mockReturnValue('foo=bar');
      nock('https://100.200.1.2', { cookie: 'foo=bar' })
        .get('/proxy/network/api/s/default/stat/device')
        .reply(200, {
          data: [
            { name: 'bar', mac: 'bar' },
            { name: 'Mac', mac: 'mac' }
          ]
        });
      await expect(unifi.getAccessPoint('bar')).resolves.toEqual({ name: 'bar', mac: 'bar' });
    });
  });
  describe('open client events', () => {
    let webSocket, wsSpy;
    beforeEach(() => {
      webSocket = {
        on: jest.fn().mockName('ws.on')
      };
      wsSpy = jest.spyOn(ws, 'WebSocket').mockImplementation(() => {
        return webSocket;
      });
    });
    it('should open a websocket and register message and close events', async () => {
      const clients = [{ name: 'Foo', mac: 'foo' }];
      const clientMap = new Map();
      clientMap.set('foo', clients[0]);
      jest.spyOn(unifi, 'handleMessage').mockReturnValue('handleMessage');

      await unifi.openClientEvents(clients);

      expect(wsSpy).toHaveBeenCalledWith('wss://100.200.1.2/proxy/network/wss/s/default/events?clients=v2', {
        headers: { cookie: undefined },
        rejectUnauthorized: false
      });
      expect(webSocket.on).toHaveBeenCalledWith('message', 'handleMessage');
      expect(webSocket.on).toHaveBeenCalledWith('close', expect.any(Function));
      expect(unifi.handleMessage).toHaveBeenCalledWith(clientMap);
    });
    it('should log connection loss on close', async () => {
      const consoleSpy = jest.spyOn(global.console, 'log').mockReturnValue();
      jest.spyOn(global, 'setTimeout').mockReturnValue();
      await unifi.openClientEvents([]);
      const fn = webSocket.on.mock.calls[1][1];
      fn(Error('Some Error'));

      expect(consoleSpy).toHaveBeenCalledWith('Disconnected');
      expect(consoleSpy).toHaveBeenCalledWith(Error('Some Error'));
    });
    it('should reopen the connection on close', async () => {
      const clients = [{ name: 'Foo', mac: 'foo' }];
      jest.spyOn(global.console, 'log').mockReturnValue();
      const setTimeoutSpy = jest.spyOn(global, 'setTimeout').mockReturnValue();

      await unifi.openClientEvents(clients);

      const reopen = jest.spyOn(unifi, 'openClientEvents');
      const fn = webSocket.on.mock.calls[1][1];
      fn(Error('Some Error'));

      expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 5000);

      setTimeoutSpy.mock.calls[0][0]();
      expect(reopen).toHaveBeenCalledWith(clients);
    });
  });
  describe('handle message', () => {
    it('should return a function', () => {
      expect(unifi.handleMessage(new Map())).toEqual(expect.any(Function));
    });
    it('should log the response when json cant be parsed', () => {
      const handle = unifi.handleMessage(new Map());
      const consoleSpy = jest.spyOn(global.console, 'log');
      expect(handle('hsdjkd')).toBeUndefined();
      expect(consoleSpy).toHaveBeenCalledWith('Error with Event Message: hsdjkd');
    });
    it('should return undefined when the event doesnt belong to a watched device', () => {
      const handle = unifi.handleMessage(new Map([['foo', { mac: 'foo' }]]));
      expect(handle('{"data": [{"mac": "bar"}]}')).toBeUndefined();
    });
    it('should call sync on sync event type and mac matches', () => {
      const sync = jest.spyOn(unifi, 'syncMessage').mockReturnValue(undefined);
      const clients = new Map([['foo', { mac: 'foo' }]]);
      const handle = unifi.handleMessage(clients);
      const message = {
        data: [{ mac: 'foo' }, { mac: 'bar' }],
        meta: {
          message: 'client:sync'
        }
      };
      expect(handle(JSON.stringify(message))).toBeUndefined();
      expect(sync).toHaveBeenCalledWith(clients, [{ mac: 'foo' }]);
    });
    it('should call sync on sync event type and user matches', () => {
      const sync = jest.spyOn(unifi, 'syncMessage').mockReturnValue(undefined);
      const clients = new Map([['foo', { mac: 'foo' }]]);
      const handle = unifi.handleMessage(clients);
      const message = {
        data: [{ user: 'foo' }, { user: 'bar' }],
        meta: {
          message: 'client:sync'
        }
      };
      expect(handle(JSON.stringify(message))).toBeUndefined();
      expect(sync).toHaveBeenCalledWith(clients, [{ user: 'foo' }]);
    });
    it('should call event handler on sync event type and mac matches', () => {
      const event = jest.spyOn(unifi, 'eventMessage').mockReturnValue(undefined);
      const clients = new Map([['foo', { mac: 'foo' }]]);
      const handle = unifi.handleMessage(clients);
      const message = {
        data: [{ mac: 'foo' }, { mac: 'bar' }],
        meta: {
          message: 'events'
        }
      };
      expect(handle(JSON.stringify(message))).toBeUndefined();
      expect(event).toHaveBeenCalledWith(clients, [{ mac: 'foo' }]);
    });
    it('should call event handler on sync event type and user matches', () => {
      const event = jest.spyOn(unifi, 'eventMessage').mockReturnValue(undefined);
      const clients = new Map([['foo', { mac: 'foo' }]]);
      const handle = unifi.handleMessage(clients);
      const message = {
        data: [{ user: 'foo' }, { mac: 'bar' }],
        meta: {
          message: 'events'
        }
      };
      expect(handle(JSON.stringify(message))).toBeUndefined();
      expect(event).toHaveBeenCalledWith(clients, [{ user: 'foo' }]);
    });
    it('should log unhandled event', () => {
      const consoleSpy = jest.spyOn(global.console, 'log').mockReturnValue();
      const clients = new Map([['foo', { mac: 'foo' }]]);
      const handle = unifi.handleMessage(clients);
      const message = {
        data: [{ mac: 'foo' }],
        meta: {
          message: 'something'
        }
      };
      expect(handle(JSON.stringify(message))).toBeUndefined();
      expect(consoleSpy).toHaveBeenCalledWith('unhandled event', message);
    });
  });
  describe('sync Message', () => {
    it('should change relevant values and send the new data', async () => {
      const events = [{ mac: 'foo', essid: 'ssid', ap_mac: 'ap', ip: '10.10.1.1', wifi_experience_score: 70 }];
      const clients = new Map([['foo', { connected: false }]]);

      jest.spyOn(unifi, 'getAccessPoint').mockReturnValue('Access Point');
      const send = jest.spyOn(unifi, 'send').mockReturnValue();

      await unifi.syncMessage(clients, events);

      const client = clients.get('foo');
      expect(client.ap).toEqual('Access Point');
      expect(client.ssid).toEqual('ssid');
      expect(client.ip).toEqual('10.10.1.1');
      expect(client.experience).toEqual(70);
      expect(client.connected).toEqual(true);
      expect(send).toHaveBeenCalledWith(client);
    });
    it('should not send when the data is equal', async () => {
      const events = [{ mac: 'foo', essid: 'ssid', ap_mac: 'ap', ip: '10.10.1.1', wifi_experience_score: 70 }];
      const clients = new Map([['foo', { ap: 'Access Point', ssid: 'ssid', ip: '10.10.1.1', experience: 70, connected: true }]]);

      jest.spyOn(unifi, 'getAccessPoint').mockReturnValue('Access Point');
      const send = jest.spyOn(unifi, 'send').mockReturnValue();

      await unifi.syncMessage(clients, events);

      const client = clients.get('foo');
      expect(client.ap).toEqual('Access Point');
      expect(client.ssid).toEqual('ssid');
      expect(client.ip).toEqual('10.10.1.1');
      expect(client.experience).toEqual(70);
      expect(client.connected).toEqual(true);
      expect(send).not.toHaveBeenCalledWith(client);
    });
  });
  describe('event Message', () => {
    it('should change relevant values and send the new data', async () => {
      const events = [{ user: 'foo', ssid: 'ssid', ap: 'ap', key: 'EVT_WU_Connected' }];
      const clients = new Map([['foo', { user: 'foo' }]]);
      jest.spyOn(unifi, 'getAccessPoint').mockReturnValue('Access Point');
      const send = jest.spyOn(unifi, 'send').mockReturnValue();
      await unifi.eventMessage(clients, events);

      const client = clients.get('foo');
      expect(client.ap).toEqual('Access Point');
      expect(client.ssid).toEqual('ssid');
      expect(client.connected).toEqual(true);
      expect(send).toHaveBeenCalledWith(client);
    });
    it('should not send unchanged data', async () => {
      const events = [{ user: 'foo', ssid: 'ssid', ap: 'ap', key: 'EVT_WU_Connected' }];
      const clients = new Map([['foo', { user: 'foo', ssid: 'ssid', ap: 'Access Point', connected: true }]]);
      jest.spyOn(unifi, 'getAccessPoint').mockReturnValue('Access Point');
      const send = jest.spyOn(unifi, 'send').mockReturnValue();
      await unifi.eventMessage(clients, events);

      const client = clients.get('foo');
      expect(send).not.toHaveBeenCalledWith(client);
    });
    it('should change the connected state', async () => {
      const events = [{ user: 'foo', ssid: 'ssid', ap: 'ap', key: 'EVT_WU_Disconnected' }];
      const clients = new Map([['foo', { user: 'foo', ssid: 'ssid', ap: 'Access Point', connected: true }]]);
      jest.spyOn(unifi, 'getAccessPoint').mockReturnValue('Access Point');
      const send = jest.spyOn(unifi, 'send').mockReturnValue();
      await unifi.eventMessage(clients, events);

      const client = clients.get('foo');
      expect(client.connected).toEqual(false);
      expect(send).toHaveBeenCalledWith(client);
    });
    it('should not change the connected state on other event', async () => {
      const events = [{ user: 'foo', ssid: 'ssid', ap: 'ap', key: 'Something' }];
      const clients = new Map([['foo', { user: 'foo', ssid: 'ssid', ap: 'Access Point', connected: true }]]);
      jest.spyOn(unifi, 'getAccessPoint').mockReturnValue('Access Point');
      const send = jest.spyOn(unifi, 'send').mockReturnValue();
      await unifi.eventMessage(clients, events);

      const client = clients.get('foo');
      expect(client.connected).toEqual(true);
      expect(send).not.toHaveBeenCalledWith(client);
    });
  });
  describe('send', () => {
    it('should send the client to mqtt', () => {
      unifi.send({ name: 'foo bar' });
      expect(mqtt.send).toHaveBeenCalledWith('UniFi/clients/foo-bar', '{"name":"foo bar"}');
    });
  });
});
