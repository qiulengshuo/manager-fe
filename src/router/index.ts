import { createRouter, createWebHashHistory } from 'vue-router';
import storage from './../utils/storage';
import API from './../api';
import shared from './../utils/shared';
const routes = [
  {
    name: 'Home',
    path: '/',
    meta: {
      title: '首页',
    },
    redirect: '/welcome',
    component: () => import('../views/Home.vue'),
    children: [
      {
        name: 'Welcome',
        path: '/welcome',
        meta: {
          title: '欢迎页',
        },
        component: () => import('../views/Welcome.vue'),
      },
    ],
  },
  {
    name: 'Login',
    path: '/login',
    meta: {
      title: '登录',
    },
    component: () => import('../views/Login.vue'),
  },
  {
    path: '/:catchError(.*)',
    meta: {
      title: '页面不存在',
    },
    component: () => import('../views/404.vue'),
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

router.beforeEach(async (to, from, next) => {
  // 已经注册过
  if (to.name) {
    // if (router.hasRoute(to.name as any)) {
    document.title = to.meta.title as any;
    next();
    // } else {
    //   next();
    // }
    // 还没有注册过
  } else {
    await loadAsyncRoutes();
    const curRoute = router.getRoutes().filter((item) => item.path == to.path);
    if (curRoute.length) {
      document.title = curRoute[0].meta.title as any;
      next({ ...to, replace: true });
    } else {
      next();
    }
  }
});

async function loadAsyncRoutes() {
  const userInfo = storage.getItem('userInfo') || {};
  if (userInfo.token) {
    try {
      const { menuList } = (await API.getPermissionList()) as any;
      const routes = shared.generateRoute(menuList);
      routes.map((route) => {
        const _component = route.component;
        route.component = () => import(`./../views/${_component}.vue`);
        router.addRoute('Home', route);
      });
    } catch (error) {
      console.log(error);
    }
  }
}

export default router;
