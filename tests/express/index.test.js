const express = require('../../webfrontend/htmlauth/express');
const path = require('path');
const fs = require('fs');
const { when } = require('jest-when');
jest.mock('fs', () => ({
  promises: {
    open: jest.fn().mockName('open')
  }
}));
describe('Express Handler', () => {
  let fileHandle, response, router, expressStatic;
  const configFile = path.resolve(__dirname, '../../config/unifi.json');
  beforeEach(() => {
    response = {
      send: jest.fn().mockName('send'),
      json: jest.fn().mockName('json'),
      render: jest.fn().mockName('render')
    };
    fileHandle = {
      readFile: jest.fn().mockName('readFile'),
      writeFile: jest.fn().mockName('writeFile'),
      close: jest.fn().mockName('close').mockResolvedValue()
    };
    router = {
      get: jest.fn().mockName('get'),
      put: jest.fn().mockName('put'),
      use: jest.fn().mockName('use')
    };
    expressStatic = jest.fn().mockName('static').mockReturnValue('static');

    fs.promises.open.mockResolvedValue(fileHandle);
  });
  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('router', () => {
    it('should define GET /', () => {
      express({ router, expressStatic });
      expect(router.get).toHaveBeenCalledWith('/', express.index);
    });
    it('should define GET /config', () => {
      express({ router, expressStatic });
      expect(router.get).toHaveBeenCalledWith('/config', express.getConfig);
    });
    it('should define PUST /config', () => {
      express({ router, expressStatic });
      expect(router.put).toHaveBeenCalledWith('/config', express.saveConfig);
    });
    it('should define GET /assets', () => {
      express({ router, expressStatic });
      expect(router.use).toHaveBeenCalledWith('/assets', 'static');
      expect(expressStatic).toHaveBeenCalledWith(path.resolve(__dirname, '../../webfrontend/htmlauth/assets'));
    });
  });
  describe('GET /', () => {
    it('should render index', async () => {
      await express.index({}, response);
      expect(response.render).toHaveBeenCalledWith('index', { title: 'Unifi Presence' });
    });
  });
  describe('GET /config', () => {
    it('should return an error when file cant be opened', async () => {
      fs.promises.open.mockRejectedValue(Error("Can't open file"));

      await express.getConfig({}, response);

      expect(response.json).toHaveBeenCalledWith({ error: 'Cannot read config file from unifi.json', exception: "Can't open file" });
      expect(fs.promises.open).toHaveBeenCalledWith(configFile, 'r');
    });
    it('should return an error when file cant be read', async () => {
      fileHandle.readFile.mockRejectedValue(Error("Can't read file"));

      await express.getConfig({}, response);

      expect(response.json).toHaveBeenCalledWith({ error: 'Cannot read config file from unifi.json', exception: "Can't read file" });
      expect(fs.promises.open).toHaveBeenCalledWith(configFile, 'r');
      expect(fileHandle.readFile).toHaveBeenCalled();
      expect(fileHandle.close).toHaveBeenCalled();
    });
    it('should return an error when JSON.parse throws error', async () => {
      fileHandle.readFile.mockResolvedValue('invalid json');

      await express.getConfig({}, response);

      expect(response.json).toHaveBeenCalledWith({
        error: 'Cannot read config file from unifi.json',
        exception: 'Unexpected token i in JSON at position 0'
      });
      expect(fs.promises.open).toHaveBeenCalledWith(configFile, 'r');
      expect(fileHandle.readFile).toHaveBeenCalled();
      expect(fileHandle.close).toHaveBeenCalled();
    });
    it('should return empty obhject if file is empty', async () => {
      fileHandle.readFile.mockResolvedValue('');

      await express.getConfig({}, response);

      expect(response.json).toHaveBeenCalledWith({});
      expect(fs.promises.open).toHaveBeenCalledWith(configFile, 'r');
      expect(fileHandle.readFile).toHaveBeenCalled();
      expect(fileHandle.close).toHaveBeenCalled();
    });
    it('should return the parsed file content', async () => {
      fileHandle.readFile.mockResolvedValue('{"foo": "bar"}');

      await express.getConfig({}, response);

      expect(response.json).toHaveBeenCalledWith({ foo: 'bar' });
      expect(fs.promises.open).toHaveBeenCalledWith(configFile, 'r');
      expect(fileHandle.readFile).toHaveBeenCalled();
      expect(fileHandle.close).toHaveBeenCalled();
    });
  });
  describe('PUT /config', () => {
    it('should return an error when file cant be opened', async () => {
      fs.promises.open.mockRejectedValue(Error("Can't open file"));

      await express.saveConfig({ body: {} }, response);

      expect(response.json).toHaveBeenCalledWith({ error: 'Cannot save config file unifi.json', exception: "Can't open file" });
      expect(fs.promises.open).toHaveBeenCalledWith(configFile, 'r');
    });
    it('should return an error when file cant be read', async () => {
      fileHandle.readFile.mockRejectedValue(Error("Can't read file"));

      await express.saveConfig({ body: {} }, response);

      expect(response.json).toHaveBeenCalledWith({ error: 'Cannot save config file unifi.json', exception: "Can't read file" });
      expect(fs.promises.open).toHaveBeenCalledWith(configFile, 'r');
      expect(fileHandle.readFile).toHaveBeenCalled();
      expect(fileHandle.close).toHaveBeenCalled();
    });
    it('should return an error when JSON.parse throws error', async () => {
      fileHandle.readFile.mockResolvedValue('invalid json');

      await express.saveConfig({ body: {} }, response);

      expect(response.json).toHaveBeenCalledWith({
        error: 'Cannot save config file unifi.json',
        exception: 'Unexpected token i in JSON at position 0'
      });
      expect(fs.promises.open).toHaveBeenCalledWith(configFile, 'r');
      expect(fileHandle.readFile).toHaveBeenCalled();
      expect(fileHandle.close).toHaveBeenCalled();
    });
    it('should return an error when file cant be open for writing', async () => {
      fileHandle.readFile.mockResolvedValue('{}');
      when(fs.promises.open).calledWith(configFile, 'r').mockResolvedValue(fileHandle);
      when(fs.promises.open).calledWith(configFile, 'w+').mockRejectedValue(Error('Cannot open file for saving'));

      await express.saveConfig({ body: {} }, response);

      expect(response.json).toHaveBeenCalledWith({
        error: 'Cannot save config file unifi.json',
        exception: 'Cannot open file for saving'
      });
      expect(fs.promises.open).toHaveBeenCalledWith(configFile, 'r');
      expect(fileHandle.readFile).toHaveBeenCalled();
      expect(fileHandle.close).toHaveBeenCalledTimes(1);
    });
    it('should return an error when file cant be saved', async () => {
      fileHandle.readFile.mockResolvedValue('{}');
      fileHandle.writeFile.mockRejectedValue(Error('unable to write'));

      await express.saveConfig({ body: {} }, response);

      expect(response.json).toHaveBeenCalledWith({
        error: 'Cannot save config file unifi.json',
        exception: 'unable to write'
      });
      expect(fs.promises.open).toHaveBeenCalledWith(configFile, 'r');
      expect(fileHandle.readFile).toHaveBeenCalled();
      expect(fileHandle.writeFile).toHaveBeenCalled();
      expect(fileHandle.close).toHaveBeenCalledTimes(2);
    });
    it('should return an error when file cant be saved', async () => {
      fileHandle.readFile.mockResolvedValue('{"username": "foo"}');
      fileHandle.writeFile.mockResolvedValue();

      await express.saveConfig({ body: { username: 'bar', foo: 'foo' } }, response);

      expect(response.json).toHaveBeenCalledWith({ username: 'bar', foo: 'foo' });
      expect(fs.promises.open).toHaveBeenCalledWith(configFile, 'r');
      expect(fileHandle.readFile).toHaveBeenCalled();
      expect(fileHandle.writeFile).toHaveBeenCalled();
      expect(fileHandle.close).toHaveBeenCalledTimes(2);
    });
  });
});
