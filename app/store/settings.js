import axios from 'axios';
import { mapValues, get, orderBy } from 'lodash';
import globalStore from './global';

const actionTypes = {
  LOAD_CONFIG: 'loadConfig',
  SAVE_CONFIG: 'saveConfig',
  LOAD_STATS: 'loadStats',
  LOAD_CLIENTS: 'loadClients',
  SAVE_CLIENTS: 'saveClients',
  RESTART_SERVICE: 'restartService',
  LOAD_SITES: 'loadSites'
};
const mutationTypes = {
  STORE_CONFIG: 'storeConfig',
  SHOW_TWO_FACTOR: 'showTwoFactor',
  HIDE_TWO_FACTOR: 'hideTwoFactor',
  STORE_STATS: 'storeStats',
  SET_LOGIN_REQUIRED: 'setLoginRequired',
  SET_LOGIN_ERROR: 'setLoginError',
  SET_CONNECTION_ERROR: 'setConnectionError',
  SET_CLIENTS: 'setClients',
  SET_CONFIG_CLIENTS: 'setConfigClients',
  SET_SERVICE_STATUS: 'setServiceStatus',
  SET_SITES: 'setSites'
};

const state = () => ({
  config: {},
  showTwoFactor: false,
  version: null,
  stats: {},
  loginRequired: false,
  loginError: false,
  connectionError: false,
  existingClients: [],
  clients: [],
  serviceStatus: 'DISCONNECTED',
  sites: [{ label: 'Default', value: 'default' }]
});

const catchAndHandleError = async (context, executable) => {
  try {
    context.commit(globalStore.mutationTypes.RESET_ERROR, null, { root: true });
    await executable();
    context.commit(mutationTypes.SET_CONNECTION_ERROR, false);
  } catch (error) {
    if (error.response) {
      if (error.response.status === 499) {
        context.commit(mutationTypes.SHOW_TWO_FACTOR);
        throw error;
      } else if (error.response.status === 401) {
        context.commit(mutationTypes.SET_LOGIN_REQUIRED, true);
        context.commit(mutationTypes.SET_LOGIN_ERROR, true);
        throw error;
      } else if (error.response.status === 408) {
        context.commit(mutationTypes.SET_CONNECTION_ERROR, true);
        throw error;
      }
      const message = get(error, 'response.data.error', error.message);
      context.commit(globalStore.mutationTypes.ERROR, message, { root: true });
    } else {
      context.commit(globalStore.mutationTypes.ERROR, error.message, { root: true });
    }

    throw error;
  }
};

const actions = {
  async [actionTypes.LOAD_CONFIG](context) {
    return catchAndHandleError(context, async () => {
      const response = await axios.get('/plugins/unifi_presence/api/config');
      context.commit(mutationTypes.STORE_CONFIG, response.data);
    });
  },
  async [actionTypes.SAVE_CONFIG](context) {
    context.commit(mutationTypes.HIDE_TWO_FACTOR);
    context.commit(mutationTypes.SET_LOGIN_ERROR, false);
    return catchAndHandleError(context, async () => {
      const response = await axios.put(
        '/plugins/unifi_presence/api/config',
        Object.assign(context.state.config, { loginRequired: context.state.loginRequired })
      );
      context.commit(mutationTypes.STORE_CONFIG, response.data);
    });
  },
  async [actionTypes.LOAD_STATS](context) {
    return catchAndHandleError(context, async () => {
      const response = await axios.get('/plugins/unifi_presence/api/stats');
      context.commit(mutationTypes.STORE_STATS, response.data);
      context.commit(mutationTypes.SET_LOGIN_REQUIRED, false);
    });
  },
  async [actionTypes.LOAD_CLIENTS](context) {
    return catchAndHandleError(context, async () => {
      const response = await axios.get('/plugins/unifi_presence/api/clients');
      context.commit(mutationTypes.SET_CLIENTS, response.data.clients);
    });
  },
  async [actionTypes.SAVE_CLIENTS](context, { mac, value }) {
    return catchAndHandleError(context, async () => {
      const clients = context.state.clients
        .filter((client) => (client.mac != mac && client.watched) || (client.mac == mac && value === true))
        .map((client) => {
          const cloned = Object.assign({}, client);
          delete cloned.watched;
          return cloned;
        });

      const response = await axios.put('/plugins/unifi_presence/api/config', { clients });
      context.commit(mutationTypes.SET_CONFIG_CLIENTS, response.data.clients);
    });
  },
  async [actionTypes.RESTART_SERVICE](context) {
    return catchAndHandleError(context, async () => {
      await axios.post('/plugins/unifi_presence/api/restartService');
    });
  },
  async [actionTypes.LOAD_SITES](context) {
    return catchAndHandleError(context, async () => {
      const response = await axios.get('/plugins/unifi_presence/api/sites');
      context.commit(mutationTypes.SET_SITES, response.data.sites);
    });
  }
};
const mutations = {
  [mutationTypes.STORE_CONFIG](state, config) {
    state.config = config;
    state.existingClients = config.clients.map((client) => client.mac);
  },
  [mutationTypes.STORE_STATS](state, stats) {
    if (stats.version) {
      state.version = stats.version;
    }
    state.stats = {
      wan: stats.wan,
      www: stats.www
    };
  },
  [mutationTypes.SHOW_TWO_FACTOR](state) {
    state.showTwoFactor = true;
    state.config.token = null;
    state.twoFaEnabled = true;
  },
  [mutationTypes.HIDE_TWO_FACTOR](state) {
    state.showTwoFactor = false;
  },
  [mutationTypes.SET_LOGIN_REQUIRED](state, required) {
    state.loginRequired = required;
  },
  [mutationTypes.SET_LOGIN_ERROR](state, error) {
    state.loginError = error;
    state.twoFaEnabled = false;
  },
  [mutationTypes.SET_CONNECTION_ERROR](state, error) {
    state.connectionError = error;
  },
  [mutationTypes.SET_CLIENTS](state, clients) {
    clients = clients.map((client) => {
      client.watched = state.existingClients.includes(client.mac);
      return client;
    });

    state.clients = orderBy(clients, ['watched', 'type'], ['desc', 'desc']);
  },
  [mutationTypes.SET_CONFIG_CLIENTS](state, clients) {
    state.config.clients = clients;
  },
  [mutationTypes.SET_SERVICE_STATUS](state, status) {
    state.serviceStatus = status;
  },
  [mutationTypes.SET_SITES](state, sites) {
    state.sites = sites;
  }
};

export default {
  name: 'Settings',
  namespaced: true,
  state,
  actions,
  mutations,
  mutationTypes: mapValues(mutationTypes, (type) => `Settings/${type}`),
  actionTypes: mapValues(actionTypes, (type) => `Settings/${type}`)
};
