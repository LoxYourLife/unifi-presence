const config = require('../../bin/unifi.config');
describe('unifi pm2 config', () => {
  it('should be as expected', () => {
    expect(config).toEqual([{ args: 'events', name: 'UniFi Event Server', script: 'index.js', stop_exit_codes: [20, 21] }]);
  });
});
