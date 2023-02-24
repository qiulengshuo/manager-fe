import { createRouter, createWebHashHistory } from 'vue-router';

const routes = [
  {
    name: 'Home',
    path: '/',
    meta: {
      title: 'Home',
    },
    redirect: '/welcome',
    component: () => import('../views/Home.vue'),
    children: [
      {
        name: 'Welcome',
        path: '/welcome',
        meta: {
          title: 'Welcome',
        },
        component: () => import('../views/Welcome.vue'),
      },
      {
        name: 'User',
        path: '/user',
        meta: {
          title: 'User',
        },
        component: () => import('../views/User.vue'),
      },
    ],
  },
  {
    name: 'Login',
    path: '/login',
    meta: {
      title: 'Login',
    },
    component: () => import('../views/Login.vue'),
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
