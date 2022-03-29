<template>
  <div class="q-pa-md">
    <div class="q-gutter-y-md bg-light-green-7">
      <q-tabs inline-label class="text-grey-3 bg-light-green-6" active-color="white bg-light-green-7" indicator-color="light-green-9" align="justify">
        <q-route-tab name="mails" :to="{name: 'settings'}" icon="settings" :label="$t('UNIFI.SETTINGS')" />
        <q-route-tab name="alarms" :to="{name: 'clients'}" icon="router" :label="$t('UNIFI.DEVICES')" />
      </q-tabs>
    </div>
  </div>
  <q-page padding>
    <div class="row">
      <div class="col-5 col-md-4 col-lg-3 q-pt-md">
        <UnifiController />
      </div>
      <q-space />
      <div class="col-6 col-md-7 col-lg-8">
        <router-view />
      </div>
    </div>
  </q-page>
</template>
<script>
import UnifiController from './UnifiController.vue';
export default {
  name: 'Page',
  components: {
    UnifiController
  },
  setup() {
    return {};
  }
};
</script>
