const CookieParser = require('../../../bin/lib/CookieParser');
const Cookie = require('../../../bin/lib/CookieParser').Cookie;
const fs = require('fs');
jest.mock('fs', () => ({
  promises: {
    open: jest.fn().mockName('open'),
    access: jest.fn().mockName('access')
  },
  constants: {
    R_OK: 'R_OK',
    W_OK: 'W_OK'
  }
}));

describe('Cookie Parser', () => {
  let directories, cookieParser, cookies;
  beforeEach(async () => {
    directories = {
      config: 'config',
      data: 'data',
      homedir: 'homedir'
    };
    cookies = [
      { name: 'name', value: 'content=te', expires: new Date('2021-03-20 15:09:07').toISOString(), domain: 'unifi.com', path: '/' },
      { name: 'another_name', value: 'value', expires: new Date('2021-03-21 15:09:07').toISOString(), domain: 'unifi.de', path: '/' }
    ];

    cookieParser = new CookieParser(directories);
  });

  describe('constructor', () => {
    it('should set the cookies file', () => {
      expect(cookieParser.storageFile).toEqual('data/unifi.cookies.json');
    });
    it('should set the cookies to empty', () => {
      expect(cookieParser.cookies).toEqual({});
    });
  });
  describe('parseAndAdd', () => {
    it('should parse a simple cookie', () => {
      cookieParser.parseAndAdd('name=foo');
      expect(cookieParser.cookies).toEqual({
        name: { domain: undefined, expires: undefined, name: 'name', path: undefined, value: 'foo' }
      });
    });
    it('should parse a cookie with expires, domain and path', () => {
      cookieParser.parseAndAdd('name=foo;domain=unifi.com;path=/foo;expires=2021-03-17T08:12:43.000Z');
      expect(cookieParser.cookies).toEqual({
        name: { domain: 'unifi.com', expires: new Date('2021-03-17T08:12:43.000Z'), name: 'name', path: '/foo', value: 'foo' }
      });
    });
    it('should ignore other values from a cookie', () => {
      cookieParser.parseAndAdd('name=foo;domain=unifi.com;path=/foo;expires=2021-03-17T08:12:43.000Z;foo=bar');
      expect(cookieParser.cookies).toEqual({
        name: { domain: 'unifi.com', expires: new Date('2021-03-17T08:12:43.000Z'), name: 'name', path: '/foo', value: 'foo' }
      });
    });
    it('with empty epires', () => {
      cookieParser.parseAndAdd('name=foo;domain=unifi.com;path=/foo;expires=;foo=bar');
      expect(cookieParser.cookies).toEqual({
        name: { domain: 'unifi.com', expires: undefined, name: 'name', path: '/foo', value: 'foo' }
      });
    });
    it('with empty value', () => {
      cookieParser.parseAndAdd('name=;domain=unifi.com;path=/foo;expires=;foo=bar');
      expect(cookieParser.cookies).toEqual({
        name: { domain: 'unifi.com', expires: undefined, name: 'name', path: '/foo', value: '' }
      });
    });
    it('should parse multiple cookies at once', () => {
      cookieParser.parseAndAdd([
        'name=foo;domain=unifi.com;path=/foo;expires=2021-03-17T08:12:43.000Z',
        'bar=bar;domain=unifi.de;path=/bar;expires=2021-04-17T07:12:43.000Z'
      ]);
      expect(cookieParser.cookies).toEqual({
        name: new Cookie({ domain: 'unifi.com', expires: new Date('2021-03-17T08:12:43.000Z'), name: 'name', path: '/foo', value: 'foo' }),
        bar: new Cookie({ domain: 'unifi.de', expires: new Date('2021-04-17T07:12:43.000Z'), name: 'bar', path: '/bar', value: 'bar' })
      });
    });
  });
  describe('serialize', () => {
    beforeEach(async () => {
      fs.promises.access.mockResolvedValue(true);
      const fileHandle = {
        readFile: jest.fn().mockResolvedValue(JSON.stringify(cookies))
      };
      fs.promises.open.mockResolvedValue(fileHandle);
      await cookieParser.load();
    });
    it('returns empty string when no cookies available', () => {
      cookieParser.cookies = {};
      expect(cookieParser.serialize()).toEqual('');
    });
    it('returns all cookies when no url is given', () => {
      expect(cookieParser.serialize()).toEqual('name="content=te"; another_name=value');
    });
    it('returns only relevant cookies when https url is given', () => {
      expect(cookieParser.serialize('https://www.unifi.com')).toEqual('name="content=te"');
    });
    it('returns only relevant cookies when http url is given', () => {
      expect(cookieParser.serialize('http://www.unifi.de')).toEqual('another_name=value');
    });
    it('returns only relevant cookies when no www is given', () => {
      expect(cookieParser.serialize('http://unifi.de')).toEqual('another_name=value');
    });
    it('returns only relevant cookies when hostname is given', () => {
      expect(cookieParser.serialize('unifi.com')).toEqual('name="content=te"');
    });
  });
  describe('save', () => {
    it('fails when the file cant be accessed', async () => {
      fs.promises.access.mockRejectedValue(Error('Cannot access file'));
      await expect(cookieParser.save()).rejects.toEqual(Error('Cannot access file'));
      expect(fs.promises.access).toHaveBeenCalledWith('data/unifi.cookies.json', 0);
    });
    it('fails when the file cant be opened', async () => {
      fs.promises.access.mockResolvedValue(true);
      fs.promises.open.mockRejectedValue(Error('Cannot open file'));
      await expect(cookieParser.save()).rejects.toEqual(Error('Cannot open file'));
      expect(fs.promises.open).toHaveBeenCalledWith('data/unifi.cookies.json', 'r');
    });
    it('fails when the file cant be read', async () => {
      fs.promises.access.mockResolvedValue(true);
      const fileHandle = {
        writeFile: jest.fn().mockRejectedValue(Error('Cannot write file'))
      };
      fs.promises.open.mockResolvedValue(fileHandle);
      await expect(cookieParser.save()).rejects.toEqual(Error('Cannot write file'));
      expect(fileHandle.writeFile).toHaveBeenCalledWith('[]', 'UTF-8');
    });
    it('succeeds when the file can be written', async () => {
      cookieParser.cookies = {
        name: new Cookie({
          name: 'name',
          value: 'content=te',
          expires: new Date('2021-03-20 15:09:07'),
          domain: 'unifi.com',
          path: '/'
        })
      };
      fs.promises.access.mockResolvedValue(true);
      const fileHandle = {
        writeFile: jest.fn().mockResolvedValue()
      };
      fs.promises.open.mockResolvedValue(fileHandle);
      await expect(cookieParser.save()).resolves.toBeUndefined();
      expect(fileHandle.writeFile).toHaveBeenCalledWith(
        '[{"name":"name","value":"content=te","expires":"2021-03-20T14:09:07.000Z","domain":"unifi.com","path":"/"}]',
        'UTF-8'
      );
    });
    it('saves real cookies with string as date', async () => {
      cookieParser.cookies = {
        name: new Cookie({
          name: 'name',
          value: 'content=te',
          expires: '2021-03-20 15:09:07',
          domain: 'unifi.com',
          path: '/'
        })
      };
      fs.promises.access.mockResolvedValue(true);
      const fileHandle = {
        writeFile: jest.fn().mockResolvedValue()
      };
      fs.promises.open.mockResolvedValue(fileHandle);
      await expect(cookieParser.save()).resolves.toBeUndefined();
      expect(fileHandle.writeFile).toHaveBeenCalledWith(
        '[{"name":"name","value":"content=te","expires":null,"domain":"unifi.com","path":"/"}]',
        'UTF-8'
      );
    });
  });
  describe('load', () => {
    it('fails when the file cant be accessed', async () => {
      fs.promises.access.mockRejectedValue(Error('cant access file'));
      await expect(cookieParser.load()).rejects.toEqual(Error('cant access file'));
      expect(fs.promises.access).toHaveBeenCalledWith('data/unifi.cookies.json', 0);
    });
    it('fails when the file cant be opened', async () => {
      fs.promises.access.mockResolvedValue(true);
      fs.promises.open.mockRejectedValue(Error('Cannot open file'));
      await expect(cookieParser.load()).rejects.toEqual(Error('Cannot open file'));
      expect(fs.promises.open).toHaveBeenCalledWith('data/unifi.cookies.json', 'r');
    });
    it('fails when the file cant be read', async () => {
      fs.promises.access.mockResolvedValue(true);
      const fileHandle = {
        readFile: jest.fn().mockRejectedValue(Error('Cannot read file'))
      };
      fs.promises.open.mockResolvedValue(fileHandle);
      await expect(cookieParser.load()).rejects.toEqual(Error('Cannot read file'));
      expect(fileHandle.readFile).toHaveBeenCalled();
    });
    it('fails when the file content cant be parsed', async () => {
      fs.promises.access.mockResolvedValue(true);
      const fileHandle = {
        readFile: jest.fn().mockResolvedValue('invalid json')
      };
      fs.promises.open.mockResolvedValue(fileHandle);
      await expect(cookieParser.load()).rejects.toEqual(SyntaxError('Unexpected token i in JSON at position 0'));
      expect(fileHandle.readFile).toHaveBeenCalled();
    });
    it('fails when the file content cant be parsed', async () => {
      fs.promises.access.mockResolvedValue(true);
      const fileHandle = {
        readFile: jest.fn().mockResolvedValue('invalid json')
      };
      fs.promises.open.mockResolvedValue(fileHandle);
      await expect(cookieParser.load()).rejects.toEqual(SyntaxError('Unexpected token i in JSON at position 0'));
    });
    it('loads and parses cookies successfully', async () => {
      fs.promises.access.mockResolvedValue(true);
      const fileHandle = {
        readFile: jest.fn().mockResolvedValue(JSON.stringify(cookies))
      };
      fs.promises.open.mockResolvedValue(fileHandle);
      await expect(cookieParser.load()).resolves.toBeUndefined();
      expect(fileHandle.readFile).toHaveBeenCalled();
      expect(cookieParser.cookies).toEqual({
        another_name: new Cookie(cookies[1]),
        name: new Cookie(cookies[0])
      });
    });
    it('fails when cookie file contains wrong format', async () => {
      fs.promises.access.mockResolvedValue(true);
      const fileHandle = {
        readFile: jest.fn().mockResolvedValue('true')
      };
      fs.promises.open.mockResolvedValue(fileHandle);
      await expect(cookieParser.load()).rejects.toEqual(Error('Cookies cannot be loaded'));
      expect(cookieParser.cookies).toEqual({});
    });
  });
  describe('reset', () => {
    beforeEach(() => {
      jest.spyOn(cookieParser, 'save').mockResolvedValue();
    });
    it('resets the cookies and saves empty list', async () => {
      await expect(cookieParser.reset()).resolves.toBeUndefined();
      expect(cookieParser.cookies).toEqual({});
      expect(cookieParser.save).toHaveBeenCalled();
    });
  });
  describe('is session expired', () => {
    it('returns true when no session is cookie is present', () => {
      cookieParser.cookies = {
        name: new Cookie({
          name: 'name',
          value: 'content=te',
          expires: new Date('2021-03-20 15:09:07').toISOString(),
          domain: 'unifi.com',
          path: '/'
        })
      };
      expect(cookieParser.isSessionExpired()).toBeTruthy();
    });
    it('returns true when session cookie is expired', () => {
      cookieParser.cookies = {
        name: new Cookie({
          name: 'session-id',
          value: 'content=te',
          expires: new Date('2020-03-20 15:09:07'),
          domain: 'unifi.com',
          path: '/'
        })
      };
      expect(cookieParser.isSessionExpired()).toBeTruthy();
    });
    it('returns false when session cookie is expired', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      cookieParser.cookies = {
        name: new Cookie({
          name: 'session-id',
          value: 'content=te',
          expires: tomorrow,
          domain: 'unifi.com',
          path: '/'
        })
      };
      expect(cookieParser.isSessionExpired()).toBeFalsy();
    });
  });
});
