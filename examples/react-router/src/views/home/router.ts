import type { RouteRecordRaw } from 'vue-router'

export default [
  {
    path: '/',
    redirect: '/micro-app-2/home',
  },
  {
    path: '/micro-app-2/home',
    component: () => import('./index.vue'),
  },
] as RouteRecordRaw[]
