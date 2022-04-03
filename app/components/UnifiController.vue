<template>
  <q-card class="my-card">
    <q-img :src="image" spinner-color="white" />
    <q-card-actions v-if="isLoading" align="center">
      <q-spinner color="primary" size="3em" class="q-mb-md" />
    </q-card-actions>
    <q-card-section v-else>
      <q-list>
        <q-item v-if="!connected">
          <q-item-section>
            <div class="text-h6">{{$t(`SERVICE.${serviceStatus}`)}}</div>
            <div v-if="versionError" class="text-weight-medium text-negative">{{$t('COMMON.VERSION_ERROR', {version})}}</div>
            <div v-if="loginRequired" class="text-subtitle2">{{$t('UNIFI.LOGIN_REQUIRED')}}</div>
            <div v-if="error" class="text-weight-medium text-negative">{{error}}</div>
          </q-item-section>
          <q-item-section avatar>
            <q-icon size="40px" name="warning_amber" color="orange-14" />
          </q-item-section>
        </q-item>
        <template v-else>
          <q-item>
            <q-item-section>
              <div class="text-h6">{{stats.wan.name}}</div>
              <div class="text-subtitle2">{{$t(`SERVICE.${serviceStatus}`)}}</div>
              <q-item-label caption>{{$t('UNIFI.VERSION', {version})}}</q-item-label>
            </q-item-section>
            <q-item-section avatar>
              <q-icon size="40px" name="verified" color="light-green-7" />
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section>
              <div class="row">
                <div class="col-4 text-weight-light"><span class="text-weight-medium">{{$t('UNIFI.CPU')}}:</span> {{stats.wan.stats.cpu}}%</div>
                <div class="col-5 text-weight-light"><span class="text-weight-medium">{{$t('UNIFI.MEMORY')}}:</span> {{stats.wan.stats.mem}}Mb</div>
                <div class="col-3 text-weight-light"><span class="text-weight-medium">{{$t('UNIFI.UPTIME')}}:</span> {{udmUptime}}</div>

                <div class="col-9 text-weight-light"><span class="text-weight-medium">{{$t('UNIFI.ISP')}}:</span> {{stats.www.isp}}</div>
                <div class="col-3 text-weight-light"><span class="text-weight-medium">{{$t('UNIFI.UPTIME')}}:</span> {{ispUptime}}</div>
              </div>
            </q-item-section>
          </q-item>
        </template>
      </q-list>
    </q-card-section>
    <q-separator />
    <q-card-actions>
      <q-btn class="q-ml-md" outline icon="restart_alt" size="sm" color="orange-14" :loading="restartLoading" @click="restartService" data-role="none">{{$t('SERVICE.RESTART')}}</q-btn>
    </q-card-actions>
  </q-card>
</template>

<script>
import { computed, ref } from 'vue';
import { useStore } from 'vuex';
import actionsStore from '../store/actions';
import udm from '../assets/udm.png';
import udmpro from '../assets/udmpro.png';
export default {
  name: 'UnifiController',
  setup() {
    const store = useStore();
    const config = computed(() => store.state.Settings.config);
    const isLoading = computed(() => store.state.Global.loading);
    const loginRequired = computed(() => store.state.Settings.loginRequired);
    const version = computed(() => store.state.Settings.version);
    const versionError = computed(() => store.state.Settings.versionError);
    const deviceType = computed(() => store.state.Settings.deviceType);
    const stats = computed(() => store.state.Settings.stats);
    const serviceStatus = computed(() => store.state.Settings.serviceStatus);
    const error = computed(() => store.state.Global.error);
    const connectionError = computed(() => store.state.Settings.connectionError);
    const connected = computed(() => {
      if (loginRequired.value || error.value || connectionError.value) {
        return false;
      }
      if (version.value === null || version.value < '6.4.54') {
        return false;
      }
      if (!config.value.username || !config.value.ipaddress || !config.value.password) {
        return false;
      }
      if (serviceStatus.value !== 'CONNECTED') {
        return false;
      }
      return true;
    });

    const uptime = (uptime) => {
      if (uptime < 3600) {
        return `${Math.round(uptime / 60)}m`;
      } else if (uptime < 86400) {
        return `${Math.round(uptime / 60 / 60)}h`;
      }
      return `${Math.floor(uptime / 60 / 60 / 24)}d`;
    };
    const ispUptime = computed(() => uptime(stats.value.www.uptime));
    const udmUptime = computed(() => uptime(stats.value.wan.stats.uptime));
    const restartLoading = ref(false);
    const restartService = async () => {
      restartLoading.value = true;
      await store.dispatch(actionsStore.actionTypes.RESTART_SERVICE, null, { root: true });
      restartLoading.value = false;
    };

    const image = computed(() => {
      const device = deviceType.value || '';
      if (device.toLowerCase().indexOf('pro') != -1) return udmpro;
      return udm;
    });

    return {
      isLoading,
      version,
      versionError,
      loginRequired,
      error,
      connected,
      stats,
      ispUptime,
      udmUptime,
      serviceStatus,
      restartLoading,
      restartService,
      image
    };
  }
};
</script>