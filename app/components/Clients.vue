<template>
  <q-banner v-if="versionError" rounded class="bg-red text-white q-mt-md">
    {{$t('COMMON.VERSION_ERROR', {version})}}
  </q-banner>
  <div class="row" v-if="!versionError">
    <div class="col-12">
      <div class="text-h5 self-end">{{ $t('UNIFI.DEVICES') }}</div>
      <q-separator spaced />
      <p>{{$t('UNIFI.CLIENT_SELECTION')}}</p>

      <q-banner v-if="hasAndroid" dense rounded class="bg-orange-13 text-white q-my-md">
        <template v-slot:avatar>
          <q-icon name="warning" color="white" />
        </template>
        <template v-slot:action>
          <q-btn flat color="white" :label="$t('UNIFI.ANDROID_DEVICE_LINK')" href="https://www.hotsplots.de/fileadmin/Daten/Support/Downloads/Kurzanleitung_MAC-Adresse.pdf" target="_blank" />
        </template>
        {{$t('UNIFI.ANDROID_DEVICES')}}
      </q-banner>

      <div class="row">
        <div class="col-3">
          <q-input clearable bottom-slots v-model="search" :label="$t('UNIFI.SEARCH')" dense>
            <template v-slot:append>
              <q-icon name="search" />
            </template>
          </q-input>
        </div>
        <q-space />
        <div class="col-4">
          <q-toggle v-model="showWifi" :label="$t('UNIFI.SHOW_WIFI')" />
          <q-toggle v-model="showWired" :label="$t('UNIFI.SHOW_WIRED')" />
        </div>
        <div class="col-2">
          <q-toggle v-model="showOffline" :label="$t('UNIFI.SHOW_OFFLINE')" />
        </div>
        <div class="col-2">
          <q-select v-model="sorting" dense emit-value map-options :options="sortOptions" :label="$t('UNIFI.SORT')" />
        </div>
      </div>
      <q-markup-table bordered separator="vertical">
        <thead class="bg-light-green-7 text-white">
          <tr>
            <th class="text-left"></th>
            <th class="text-left">{{$t('UNIFI.NAME')}}</th>
            <th class="text-left">{{$t('UNIFI.MAC')}}</th>
            <th class="text-left">{{$t('UNIFI.SSID')}}</th>
            <th class="text-left">{{$t('UNIFI.EXPERIENCE')}}</th>
            <th class="text-left">{{$t('UNIFI.TYPE')}}</th>
          </tr>
        </thead>
        <tbody class="">
          <template v-if="isLoading">
            <tr v-for="n in 10" v-bind:key="n">
              <td v-for="x in 6" v-bind:key="x">
                <q-skeleton animation="blink" type="text" />
              </td>
            </tr>
          </template>
          <template v-else>
            <tr v-for="client in clients" v-bind:key="client.mac">
              <td>
                <q-toggle :name="client.mac" @update:model-value="update(client.mac, !client.watched)" v-model="client.watched" size="md" />
              </td>
              <td>{{client.name}}</td>
              <td>{{client.mac}}</td>
              <td>{{client.ssid}}</td>
              <td v-if="client.type === 'WIRELESS' && client.experience">
                {{client.experience}}
                <q-icon class="float-right" :name="wifiIcon(client.signalPercentage)" size="22px" />
              </td>
              <td v-else-if="client.type === 'WIRELESS'">Offline</td>
              <td v-else>-</td>
              <td>{{client.type}}</td>

            </tr>
          </template>
        </tbody>
      </q-markup-table>

    </div>
  </div>
</template>
<style scoped>
.q-icon {
  margin-top: -5px;
}
</style>
<script>
import { ref, computed } from 'vue';
import { useStore } from 'vuex';
import actionStore from '../store/actions';
import { lowerCase, orderBy } from 'lodash';
import { useI18n } from 'vue-i18n/index';

export default {
  name: 'Clients',
  setup() {
    const { t } = useI18n({ useScope: 'global' });
    const store = useStore();

    const versionError = computed(() => store.state.Settings.versionError);
    const version = computed(() => store.state.Settings.version);
    if (versionError.value === false) store.dispatch(actionStore.actionTypes.LOAD_CLIENTS);

    const isLoading = computed(() => store.state.Global.loading);
    const clients = computed(() => {
      const list = store.state.Settings.clients;

      const filtered = list.filter((entry) => {
        const isWireless = entry.type === 'WIRELESS';
        const isWired = entry.type === 'WIRED';
        const isOffline = entry.type === 'WIRELESS' && !entry.experience;

        if (isWireless && showWifi.value !== isWireless) return false;
        if (isWired && showWired.value !== isWired) return false;
        if (isOffline && showOffline.value === !isOffline) return false;
        if (search.value) {
          if (lowerCase(entry.name).indexOf(lowerCase(search.value)) != -1) return true;
          if (lowerCase(entry.mac).indexOf(lowerCase(search.value)) != -1) return true;
          if (entry.ssid && lowerCase(entry.ssid).indexOf(lowerCase(search.value)) != -1) return true;

          return false;
        }
        return true;
      });

      if (sorting.value === 'standard') return filtered;

      const order = ['signalPercentage', 'watched'].includes(sorting.value) ? 'desc' : 'asc';
      return orderBy(filtered, [sorting.value], [order]);
    });

    const hasAndroid = computed(() => {
      const clients = store.state.Settings.clients;
      return clients.filter((client) => /google/i.test(client.system)).length > 0;
    });
    const wifiIcon = (signal) => {
      if (signal > 77) return 'wifi';
      else if (signal > 33) return 'wifi_2_bar';
      return 'wifi_1_bar';
    };
    const update = (mac, value, c) => {
      store.dispatch(actionStore.actionTypes.SAVE_CLIENTS, { mac, value });
    };
    const showWifi = ref(true);
    const showOffline = ref(true);
    const showWired = ref(true);
    const search = ref('');
    const sorting = ref('standard');
    const sortOptions = [
      { label: t('SORTING.STANDARD'), value: 'standard' },
      { label: t('SORTING.SELECTED'), value: 'watched' },
      { label: t('SORTING.NAME'), value: 'name' },
      { label: t('SORTING.SSID'), value: 'ssid' },
      { label: t('SORTING.EXPERIENCE'), value: 'signalPercentage' },
      { label: t('SORTING.TYPE'), value: 'type' }
    ];
    return {
      isLoading,
      clients,
      update,
      wifiIcon,
      showWifi,
      showOffline,
      showWired,
      search,
      sorting,
      sortOptions,
      versionError,
      version,
      hasAndroid
    };
  }
};
</script>
