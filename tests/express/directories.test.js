const path = require('path');

const nodeEnv = process.env.NODE_ENV;

describe('directories', () => {
  beforeEach(() => {
    delete require.cache[require.resolve('../../webfrontend/htmlauth/directories')];
  });
  afterEach(() => {
    process.env.NODE_ENV = 'test';

    delete require.cache[require.resolve('../../webfrontend/htmlauth/directories')];
  });
  describe('production mode', () => {
    it('returns all directories', () => {
      process.env.NODE_ENV = 'production';
      const directories = require('../../webfrontend/htmlauth/directories');
      expect(directories()).toEqual({
        config: 'REPLACELBPCONFIGDIR',
        data: 'REPLACELBPDATADIR'
      });
    });
  });
  describe('dev mode', () => {
    it('returns all directories', () => {
      process.env.NODE_ENV = 'test';

      const directories = require('../../webfrontend/htmlauth/directories');
      const root = path.resolve(__dirname, '../../');
      expect(directories()).toEqual({
        config: `${root}/config`,
        data: `${root}/data`
      });
    });
  });
});
