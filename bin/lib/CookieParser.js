const fs = require('fs');
const _ = require('lodash');

const parse = (cookies) => {
  if (_.isArray(cookies)) return cookies.flatMap(parse);
  const parts = cookies.split(';');
  const [name, value] = parts
    .shift()
    .replace(/['"]/gi, '')
    .split(/=(.+)?/);
  let path, expires, domain;

  const additions = Object.fromEntries(parts.map((part) => part.split(/=(.+)?/)));
  _.forEach(additions, (value, key) => {
    switch (key.toLowerCase().trim()) {
      case 'path':
        path = value;
        break;
      case 'expires':
        if (!_.isEmpty(value)) expires = new Date(value);
        break;
      case 'domain':
        domain = value;
        break;
      default:
    }
  });
  return [new Cookie({ name, value: value || '', expires, domain, path })];
};

class Cookie {
  constructor({ name, value, domain, expires, path }) {
    this.name = name;
    this.value = value;
    this.domain = domain;
    this.expires = expires;
    this.path = path;
  }

  serialize() {
    if (_.isString(this.value) && this.value.indexOf('=') !== -1) {
      return `${this.name}="${this.value}"`;
    }
    return `${this.name}=${this.value}`;
  }

  toObject() {
    return {
      name: this.name,
      value: this.value,
      expires: _.isDate(this.expires) ? this.expires.toISOString() : null,
      domain: this.domain,
      path: this.path
    };
  }

  matches(domain, path) {
    const isDomain = domain.endsWith(this.domain);
    const isPath = path.startsWith(this.path);
    return isDomain && isPath;
  }

  isExpired() {
    const now = new Date();
    return this.expires < now;
  }
}
module.exports = class CookieParser {
  constructor(directories) {
    this.storageFile = `${directories.data}/unifi.cookies.json`;
    this.cookies = {};
  }

  parseAndAdd(cookies) {
    const parsedCookies = parse(cookies);
    parsedCookies.forEach((cookie) => {
      this.cookies[cookie.name] = cookie;
    });
  }

  serialize(url) {
    let cookies = this.cookies;
    if (url) {
      const [domain, path] = url.replace(/https?:\/\//gi, '').split(/\/(.*)/);
      cookies = _.filter(this.cookies, (cookie) => cookie.matches(domain, '/' + path));
    }
    return _.map(cookies, (cookie) => cookie.serialize()).join('; ');
  }

  async save() {
    await fs.promises.access(this.storageFile, fs.constants.R_OK | fs.constants.W_OK);
    const data = JSON.stringify(_.map(this.cookies, (cookie) => cookie.toObject()));
    const fileHandle = await fs.promises.open(this.storageFile, 'w+');
    await fileHandle.writeFile(data, 'UTF-8');
    await fileHandle.close();
  }

  async load() {
    await fs.promises.access(this.storageFile, fs.constants.R_OK | fs.constants.W_OK);
    const fileHandle = await fs.promises.open(this.storageFile, 'r');
    const filecontent = await fileHandle.readFile();
    await fileHandle.close();
    const cookies = JSON.parse(filecontent);

    if (_.isArray(cookies)) {
      const loadedCookies = _.map(cookies, (cookie) => new Cookie(cookie));
      loadedCookies.forEach((cookie) => {
        this.cookies[cookie.name] = cookie;
      });
      return;
    }
    this.cookies = {};
    throw Error('Cookies cannot be loaded');
  }
  async reset() {
    this.cookies = {};
    return this.save();
  }

  isSessionExpired() {
    const session = _.find(this.cookies, (cookie) => cookie.name === 'session-id');
    return _.isNil(session) || session.isExpired();
  }
};
module.exports.Cookie = Cookie;
