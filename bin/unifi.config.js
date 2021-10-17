module.exports = [
  {
    name: 'UniFi Event Server',
    script: 'index.js',
    stop_exit_codes: [20, 21],
    args: 'events'
  }
];
