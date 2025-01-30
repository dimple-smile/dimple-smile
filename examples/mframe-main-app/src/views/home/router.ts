import type { RouteRecordRaw } from 'vue-router'

export default [
  {
    path: '/',
    redirect: '/main-app/home',
  },
  {
    path: '/main-app/home',
    component: () => import('./index.vue'),
  },
] as RouteRecordRaw[]
