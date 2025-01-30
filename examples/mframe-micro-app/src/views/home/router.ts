import type { RouteRecordRaw } from 'vue-router'

export default [
  {
    path: '/',
    redirect: '/micro-app-1/home',
  },
  {
    path: '/micro-app-1/home',
    component: () => import('./index.vue'),
  },
] as RouteRecordRaw[]
