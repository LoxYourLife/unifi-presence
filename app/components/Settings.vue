<template>

  <div class="row">
    <div class="col-12">
      <div class="text-h5 self-end">{{ $t('UNIFI.PLUGIN_SETTINGS') }}</div>
      <q-separator spaced />
      <q-input v-if="hasMqtt" name="topic" :ref="formFields.topic" :disable="isSaving || isLoading" :loading="isLoading" v-model="config.topic" :label="$t('UNIFI.TOPIC')" :hint="$t('UNIFI.TOPIC_HINT')" :rules="validationRules.topic" data-role="none" />
      <q-banner v-else rounded class="bg-red text-white q-mt-md">
        {{$t('UNIFI.NEED_MQTT')}}
      </q-banner>
      <q-select :ref="formFields.wiredTimeout" v-model="config.wiredTimeout" :disable="isSaving || isLoading" :loading="isLoading" emit-value map-options :options="wiredTimeoutOptions" :label="$t('UNIFI.TIMEOUT_OPTIONS')" :hint="$t('UNIFI.TIMEOUT_OPTIONS_HINT')" />

      <div class="text-h5 q-mt-xl self-end">{{$t('UNIFI.CONTROLLER')}}</div>
      <q-separator spaced />
      <q-toggle name="native" :ref="formFields.native" :disable="isSaving || isLoading" :loading="isLoading" v-model="config.native" size="lg" :label="$t('UNIFI.NATIVE_HINT')" />
      <q-input name="ip" :ref="formFields.ipAddress" :disable="isSaving || isLoading" :loading="isLoading" v-model="config.ipaddress" :label="$t('UNIFI.IP')" :hint="$t('UNIFI.IP_HINT')" :rules="validationRules.ipAddress" data-role="none" />
      <q-input name="port" :ref="formFields.port" :disable="isSaving || isLoading" :loading="isLoading" v-if="!config.native" v-model="config.port" :label="$t('UNIFI.PORT')" :hint="$t('UNIFI.PORT_HINT')" :rules="validationRules.port" data-role="none" />
      <q-input name="username" :ref="formFields.username" :disable="isSaving || isLoading" :loading="isLoading" v-model="config.username" :label="$t('UNIFI.USERNAME')" :rules="validationRules.required" :error="loginError" data-role="none" />
      <q-input name="password" :ref="formFields.password" :disable="isSaving || isLoading" :loading="isLoading" :type="showPassword ? 'password' : 'text'" v-model="config.password" :label="$t('UNIFI.PASSWORD')" :rules="validationRules.required" :error="loginError" data-role="none">
        <template v-slot:append>
          <q-icon :name="showPassword ? 'visibility_off' : 'visibility'" class="cursor-pointer" @click="showPassword = !showPassword" />
        </template>
      </q-input>
      <q-select :ref="formFields.site" v-model="config.site" :disable="isSaving || isLoading" :loading="isLoading" emit-value map-options :options="sites" :label="$t('UNIFI.SITE')" />
      <div class="row" v-if="showTwoFactor">
        <div class="col-6">
          <q-input name="twoFa" :ref="formFields.twoFa" :disable="isSaving || isLoading" :loading="isLoading" type="text" v-model="config.token" :label="$t('UNIFI.TWO_FA')" error="" data-role="none">
            <template v-slot:append>
              <q-icon name="lock" class="cursor-pointer" />
            </template>
          </q-input>
        </div>
        <q-space />
      </div>
    </div>
  </div>

  <q-space />

  <div class="row q-pt-md">
    <div class="col-12">
      <q-banner v-if="versionError" rounded class="bg-red text-white q-mt-md">
        {{$t('COMMON.VERSION_ERROR', {version})}}
      </q-banner>
      <q-btn v-else :loading="isSaving" :disable="!isSaving && isLoading" push color="light-green-7" icon="save" size="md" :label="$t(loginRequired ? 'COMMON.SAVE_AND_LOGIN_BTN' : 'COMMON.SAVE_BTN')" @click="saveSettings" />
    </div>
    <q-space />
  </div>

</template>
<style lang="scss">
.row.spaced {
  margin-bottom: 20px;
}
div.q-toggle__label {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.54);
}
</style>

<script>
import { ref, computed } from 'vue';
import { useStore } from 'vuex';
import { useI18n } from 'vue-i18n';
import actionStore from '../store/actions';
import validationRules from '../utils/validationRules';

export default {
  name: 'Settings',
  components: {},
  setup() {
    const { t } = useI18n();
    const store = useStore();
    store.dispatch(actionStore.actionTypes.LOAD_SETTINGS);

    const config = computed(() => store.state.Settings.config);
    const showTwoFactor = computed(() => store.state.Settings.showTwoFactor);
    const loginRequired = computed(() => store.state.Settings.loginRequired);
    const versionError = computed(() => store.state.Settings.versionError);
    const version = computed(() => store.state.Settings.version);
    const sites = computed(() => store.state.Settings.sites);
    const loginError = computed(() => store.state.Settings.loginError);
    const isLoading = computed(() => store.state.Global.loading);
    const serviceStatus = computed(() => store.state.Settings.serviceStatus);
    const hasMqtt = computed(() => serviceStatus.value !== 'NO_MQTT');
    const isSaving = ref(false);
    const wiredTimeoutOptions = [
      { label: t('TIMEOUT_OPTIONS.SECONDS', { count: 10 }), value: 10 },
      { label: t('TIMEOUT_OPTIONS.SECONDS', { count: 20 }), value: 20 },
      { label: t('TIMEOUT_OPTIONS.SECONDS', { count: 30 }), value: 30 },
      { label: t('TIMEOUT_OPTIONS.SECONDS', { count: 40 }), value: 40 },
      { label: t('TIMEOUT_OPTIONS.SECONDS', { count: 50 }), value: 50 },
      { label: t('TIMEOUT_OPTIONS.MINUTES', { count: 1 }), value: 60 },
      { label: t('TIMEOUT_OPTIONS.MINUTES', { count: 2 }), value: 120 },
      { label: t('TIMEOUT_OPTIONS.MINUTES', { count: 3 }), value: 180 },
      { label: t('TIMEOUT_OPTIONS.MINUTES', { count: 4 }), value: 240 },
      { label: t('TIMEOUT_OPTIONS.MINUTES', { count: 5 }), value: 300 }
    ];
    const formFields = {
      topic: ref(null),
      native: ref(null),
      ipAddress: ref(null),
      port: ref(null),
      username: ref(null),
      password: ref(null),
      twoFa: ref(null),
      site: ref(null),
      wiredTimeout: ref(null)
    };
    const saveSettings = async () => {
      const fields = Object.values(formFields).filter((field) => field.value && field.value.validate);

      fields.forEach((field) => field.value.validate());
      const errorField = fields.find((field) => {
        if ((field.value.name === 'username' || field.value.name === 'password') && loginError.value) {
          return false;
        }
        if (field.value.name === 'twoFa' && showTwoFactor) {
          return false;
        }
        return field.value.hasError;
      });

      if (errorField === undefined) {
        isSaving.value = true;
        try {
          await store.dispatch(actionStore.actionTypes.SAVE_SETTINGS);
        } finally {
          isSaving.value = false;
        }
      }
    };
    return {
      config,
      showPassword: ref(true),
      showTwoFactor,
      isLoading,
      validationRules: validationRules(t),
      formFields,
      saveSettings,
      isSaving,
      loginRequired,
      loginError,
      sites,
      versionError,
      version,
      hasMqtt,
      wiredTimeoutOptions
    };
  }
};
</script>