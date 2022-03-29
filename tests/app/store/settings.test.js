import settings from '../../../app/store/settings';
import nock from 'nock';

describe('index store', () => {
  let context;

  beforeEach(() => {
    context = {
      dispatch: jest.fn().mockName('dispatch'),
      commit: jest.fn().mockName('commit')
    };
  });

  describe('state', () => {
    it('should define a default state', () => {
      expect(settings.state()).toEqual({
        config: {
          ipaddress: ''
        },
        showTwoFactor: false,
        error: null,
        loading: false
      });
    });
  });
  describe('actions', () => {
    describe('load config', () => {
      it('should reset the error', async () => {
        nock('http://localhost').get('/config').reply(200, {});
        await settings.actions.loadConfig(context);
        expect(context.commit).toHaveBeenCalledWith('resetError');
      });
      it('should set and reset Loading', async () => {
        nock('http://localhost').get('/config').reply(200, {});
        await settings.actions.loadConfig(context);
        expect(context.commit).toHaveBeenCalledWith('resetError');
        expect(context.commit).toHaveBeenCalledWith('setLoading', true);
        expect(context.commit).toHaveBeenCalledWith('setLoading', false);
      });
      it('should fail loading the config', async () => {
        nock('http://localhost').get('/config').reply(400, { error: 'error' });
        await settings.actions.loadConfig(context);
        expect(context.commit).toHaveBeenCalledWith('error', { error: 'error' });
        expect(context.commit).toHaveBeenCalledWith('setLoading', true);
        expect(context.commit).toHaveBeenCalledWith('setLoading', false);
      });
      it('should load the config', async () => {
        const response = {
          username: 'username',
          password: 'password',
          ipaddress: '10.10.0.1',
          topic: 'UniFi/clients',
          native: true,
          port: null,
          clients: [
            {
              experience: 61,
              ip: '10.10.0.214',
              mac: 'b6:d7:2b:ec:c7:a9',
              name: 'Device',
              ssid: 'Accesspoing',
              type: 'WIRELESS',
              userId: '6154d3aacbd04403686dbcce'
            }
          ]
        };
        nock('http://localhost').get('/config').reply(200, response);
        await settings.actions.loadConfig(context);
        expect(context.commit).toHaveBeenCalledWith('storeConfig', response);
      });
    });
  });

  describe('mutations', () => {
    let state;
    beforeEach(() => {
      state = {};
    });
    it('should store config', () => {
      settings.mutations.storeConfig(state, { key: 'value' });
      expect(state.config).toEqual({ key: 'value' });
    });
    it('should set error', () => {
      settings.mutations.error(state, { error: 'message' });
      expect(state.error).toEqual({ error: 'message' });
    });
    it('should reset error', () => {
      state.error = { error: 'message' };
      settings.mutations.resetError(state);
      expect(state.error).toBeNull();
    });
    it('should set loading to true', () => {
      state.loading = false;
      settings.mutations.setLoading(state, true);
      expect(state.loading).toBeTruthy();
    });
  });
});
