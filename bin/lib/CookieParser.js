const fs = require('fs');
const _ = require('lodash');

const parse = (cookies) => {
  if (_.isArray(cookies)) return cookies.map(parse);
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
        if (null !== value) expires = new Date(value);
        break;
      case 'domain':
        domain = value;
        break;
      default:
    }
  });
  return new Cookie({ name, value: value || '', expires, domain, path });
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

    this.load();
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

  save() {
    const data = JSON.stringify(_.map(this.cookies, (cookie) => cookie.toObject()));
    fs.writeFileSync(this.storageFile, data);
  }

  load() {
    if (fs.existsSync(this.storageFile)) {
      const cookies = require(this.storageFile);
      if (_.isArray(cookies)) {
        const loadedCookies = _.map(cookies, (cookie) => new Cookie(cookie));
        loadedCookies.forEach((cookie) => {
          this.cookies[cookie.name] = cookie;
        });
      }
    }
  }
  reset() {
    this.cookies = {};
    this.save();
  }

  isSessionExpired() {
    const session = _.filter(this.cookies, (cookie) => cookie.name === 'session-id');
    return _.isNil(session) || session.isExpired();
  }
};
