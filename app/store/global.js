import { mapValues } from 'lodash';

const actionTypes = {};
const mutationTypes = {
  ERROR: 'error',
  RESET_ERROR: 'resetError',
  LOADING: 'setLoading'
};

const state = () => ({
  error: null,
  loading: false
});

const actions = {};
const mutations = {
  [mutationTypes.ERROR](state, error) {
    state.error = error;
  },
  [mutationTypes.RESET_ERROR](state) {
    state.error = null;
  },
  [mutationTypes.LOADING](state, isLoading) {
    state.loading = isLoading;
  }
};

export default {
  name: 'Global',
  namespaced: true,
  state,
  actions,
  mutations,
  mutationTypes: mapValues(mutationTypes, (type) => `Global/${type}`),
  actionTypes: mapValues(actionTypes, (type) => `Global/${type}`)
};
