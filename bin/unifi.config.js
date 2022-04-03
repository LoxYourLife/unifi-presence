process.env.NODE_ENV = '/opt/loxberry' === process.env.HOME ? 'production' : 'development';
const path = require('path');
const directories = require('./lib/directories');

module.exports = [
  {
    name: 'UniFi Event Server',
    script: 'index.js',
    cwd: __dirname,
    env: {
      NODE_ENV: process.env.NODE_ENV
    },
    out_file: path.resolve(directories.logdir, 'unifi-presence.log'),
    error_file: path.resolve(directories.logdir, 'unifi-presence-error.log'),
    pid_file: path.resolve(directories.logdir, 'unifi-presence.pid'),
    watch: false
  }
];
