import { createApp } from 'vue';
import { createI18n } from 'vue-i18n/index';
import { createStore } from 'vuex';
import App from './App.vue';
import { createRouter, createWebHistory } from 'vue-router';
import routes from './routes';
import { Quasar, Loading } from 'quasar';
import settingsStore from './store/settings';
import globalStore from './store/global';
import actionStore from './store/actions';

import de from './lang/de';
import en from './lang/en';
import { head } from 'lodash';

const app = createApp(App);
const router = createRouter({
  history: createWebHistory(),
  routes
});

const locale = head((navigator.language || navigator.userLanguage || 'de-DE').split('-'));
const i18n = createI18n({
  locale,
  fallbackLocale: 'en',
  messages: {
    de,
    en
  }
});
const store = createStore({
  modules: {
    [globalStore.name]: globalStore,
    [settingsStore.name]: settingsStore,
    [actionStore.name]: actionStore
  }
});
app.use(Quasar, { plugins: { Loading } });
app.use(router);
app.use(store);
app.use(i18n);

app.mount('#unifiPresence');
