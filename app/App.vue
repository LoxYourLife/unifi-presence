<template>
  <q-layout view="hHh lpR fFf">
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<style lang="sass">
@import '@quasar/extras/material-icons/material-icons.css'
@import '@quasar/extras/material-icons-outlined/material-icons-outlined.css'
@import 'quasar/src/css/index.sass'
@import '@quasar/extras/fontawesome-v6/fontawesome-v6.css'

#app .ui-btn
  margin-bottom: 0
  width: auto

h1.ui-title
  font-weight: 700
  line-height: 21px
  letter-spacing: normal
#page_content, #app .ui-checkbox
  margin: 0 !important
</style>

<script>
import { useStore } from 'vuex';
import settingsStore from './store/settings';
export default {
  name: 'App',
  setup() {
    const store = useStore();
    let pingInterval = null;

    const connectToSocket = () => {
      const url = `ws://${document.location.hostname}:3300/plugins/unifi_presence/api/socket`;
      const socket = new WebSocket(url, 'webClient');
      socket.onopen = (event) => {
        pingInterval = setInterval(() => socket.send('ping'), 20000);
      };
      socket.onmessage = (eventData) => {
        if (eventData.data === 'pong') return;

        const event = JSON.parse(eventData.data);
        switch (event.type) {
          case 'stats':
            return store.commit(settingsStore.mutationTypes.STORE_STATS, event.data);
          case 'serviceStatus':
            return store.commit(settingsStore.mutationTypes.SET_SERVICE_STATUS, event.data.status);
          case 'device:sync':
            return store.commit(settingsStore.mutationTypes.SYNC_DEVICE, event.data);
        }
      };
      socket.onclose = () => {
        clearInterval(pingInterval);
        setTimeout(connectToSocket, 5000);
      };
    };
    connectToSocket();
  }
};
</script>
