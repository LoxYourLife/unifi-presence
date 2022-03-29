import { mapValues, isEmpty } from 'lodash';
import settingsStore from './settings';
import globalStore from './global';

const state = () => ({});
const mutationTypes = {};
const actionTypes = {
  LOAD_SETTINGS: 'LOAD_SETTINGS',
  SAVE_SETTINGS: 'SAVE_SETTINGS',
  LOAD_CLIENTS: 'LOAD_CLIENTS',
  SAVE_CLIENTS: 'SAVE_CLIENTS',
  RESTART_SERVICE: 'RESTART_SERVICE'
};

const withLoading = async (context, continuation) => {
  context.commit(globalStore.mutationTypes.LOADING, true, { root: true });
  try {
    await continuation();
  } finally {
    context.commit(globalStore.mutationTypes.LOADING, false, { root: true });
  }
};

const actions = {
  async [actionTypes.LOAD_SETTINGS](context) {
    return withLoading(context, async () => {
      await context.dispatch(settingsStore.actionTypes.LOAD_CONFIG, null, { root: true });
      const config = context.rootState.Settings.config;
      if (config.ipaddress && config.username && config.password) {
        await context.dispatch(settingsStore.actionTypes.LOAD_STATS, null, { root: true });
        await context.dispatch(settingsStore.actionTypes.LOAD_SITES, null, { root: true });
      }
    });
  },
  async [actionTypes.SAVE_SETTINGS](context) {
    return withLoading(context, async () => {
      await context.dispatch(settingsStore.actionTypes.SAVE_CONFIG, null, { root: true });
      await context.dispatch(settingsStore.actionTypes.LOAD_STATS, null, { root: true });
      await context.dispatch(settingsStore.actionTypes.LOAD_SITES, null, { root: true });
    });
  },
  async [actionTypes.LOAD_CLIENTS](context) {
    return withLoading(context, async () => {
      if (isEmpty(context.rootState.Settings.config)) {
        await context.dispatch(actionTypes.LOAD_SETTINGS);
      }
      await context.dispatch(settingsStore.actionTypes.LOAD_CLIENTS, null, { root: true });
    });
  },
  async [actionTypes.SAVE_CLIENTS](context, { mac, value }) {
    return context.dispatch(settingsStore.actionTypes.SAVE_CLIENTS, { mac, value }, { root: true });
  },
  async [actionTypes.RESTART_SERVICE](context) {
    return context.dispatch(settingsStore.actionTypes.RESTART_SERVICE, null, { root: true });
  }
};
const mutations = {};

export default {
  name: 'Actions',
  namespaced: true,
  actions,

  actionTypes: mapValues(actionTypes, (type) => `Actions/${type}`),
  mutationTypes: mapValues(mutationTypes, (type) => `Actions/${type}`)
};
