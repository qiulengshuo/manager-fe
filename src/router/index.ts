import { createRouter, createWebHashHistory } from 'vue-router';
import Home from '../components/home.vue';

const routes = [
  {
    name: 'home',
    path: '/',
    meta: {
      title: 'home',
    },
    component: Home,
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
