import Page from './components/Page.vue';
import Settings from './components/Settings.vue';
import Clients from './components/Clients.vue';
export default [
  {
    path: '/admin/plugins/unifi_presence',
    component: Page,
    children: [
      { name: 'settings', path: '', component: Settings },
      { name: 'clients', path: 'clients', component: Clients }
    ]
  }
];
