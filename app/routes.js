import Page from './components/Page.vue';
import Settings from './components/Settings.vue';
import Clients from './components/Clients.vue';
import NotFound from './components/NotFound.vue';
export default [
  {
    base: '/admin/plugins/unifi_presence',
    path: '/',
    component: Page,
    children: [
      { name: 'settings', path: '', component: Settings },
      { name: 'clients', path: 'clients', component: Clients }
    ]
  },
  { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFound }
];
