<template>
  <q-page padding>
    <h3>Not Found</h3>
    <q-btn :to="{name: 'settings'}" label="open Settings" />
  </q-page>
</template>
<script>
import { useRouter, useRoute } from 'vue-router';

export default {
  setup() {
    const router = useRouter();
    const route = useRoute();
    console.log(route, router);
  }
};
</script>