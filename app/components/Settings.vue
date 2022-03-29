<template>

  <div class="row">
    <div class="col-12">
      <div class="text-h5 self-end">{{ $t('UNIFI.MQTT_SETTINGS') }}</div>
      <q-separator spaced />
      <q-input name="topic" :ref="formFields.topic" :disable="isSaving || isLoading" :loading="isLoading" v-model="config.topic" :label="$t('UNIFI.TOPIC')" :hint="$t('UNIFI.TOPIC_HINT')" :rules="validationRules.topic" />

      <div class="text-h5 q-mt-xl self-end">{{$t('UNIFI.CONTROLLER')}}</div>
      <q-separator spaced />
      <q-toggle name="native" :ref="formFields.native" :disable="isSaving || isLoading" :loading="isLoading" v-model="config.native" size="lg" :label="$t('UNIFI.NATIVE_HINT')" />
      <q-input name="ip" :ref="formFields.ipAddress" :disable="isSaving || isLoading" :loading="isLoading" v-model="config.ipaddress" :label="$t('UNIFI.IP')" :hint="$t('UNIFI.IP_HINT')" :rules="validationRules.ipAddress" />
      <q-input name="port" :ref="formFields.port" :disable="isSaving || isLoading" :loading="isLoading" v-if="!config.native" v-model="config.port" :label="$t('UNIFI.PORT')" :hint="$t('UNIFI.PORT_HINT')" :rules="validationRules.port" />
      <q-input name="username" :ref="formFields.username" :disable="isSaving || isLoading" :loading="isLoading" v-model="config.username" :label="$t('UNIFI.USERNAME')" :rules="validationRules.required" :error="loginError" />
      <q-input name="password" :ref="formFields.password" :disable="isSaving || isLoading" :loading="isLoading" :type="showPassword ? 'password' : 'text'" v-model="config.password" :label="$t('UNIFI.PASSWORD')" :rules="validationRules.required" :error="loginError">
        <template v-slot:append>
          <q-icon :name="showPassword ? 'visibility_off' : 'visibility'" class="cursor-pointer" @click="showPassword = !showPassword" />
        </template>
      </q-input>
      <q-select :ref="formFields.site" v-model="config.site" :disable="isSaving || isLoading" :loading="isLoading" emit-value map-options :options="sites" :label="$t('UNIFI.SITE')" />
      <div class="row" v-if="showTwoFactor">
        <div class="col-6">
          <q-input name="twoFa" :ref="formFields.twoFa" :disable="isSaving || isLoading" :loading="isLoading" type="text" v-model="config.token" :label="$t('UNIFI.TWO_FA')" error="">
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
      <q-btn :loading="isSaving" :disable="!isSaving && isLoading" push color="light-green-7" icon="save" size="md" :label="$t(loginRequired ? 'COMMON.SAVE_AND_LOGIN_BTN' : 'COMMON.SAVE_BTN')" @click="saveSettings" />
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
import { useI18n } from 'vue-i18n/index';
import actionStore from '../store/actions';
import validationRules from '../utils/validationRules';

export default {
  name: 'Settings',
  components: {},
  setup() {
    const { t } = useI18n({ useScope: 'global' });
    const store = useStore();
    store.dispatch(actionStore.actionTypes.LOAD_SETTINGS);

    const config = computed(() => store.state.Settings.config);
    const showTwoFactor = computed(() => store.state.Settings.showTwoFactor);
    const loginRequired = computed(() => store.state.Settings.loginRequired);
    const sites = computed(() => store.state.Settings.sites);
    const loginError = computed(() => store.state.Settings.loginError);
    const isLoading = computed(() => store.state.Global.loading);

    const isSaving = ref(false);
    const formFields = {
      topic: ref(null),
      native: ref(null),
      ipAddress: ref(null),
      port: ref(null),
      username: ref(null),
      password: ref(null),
      twoFa: ref(null),
      site: ref(null)
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
      sites
    };
  }
};
</script>