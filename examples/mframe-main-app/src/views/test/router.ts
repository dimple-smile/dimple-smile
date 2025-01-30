import type { RouteRecordRaw } from 'vue-router'

export default {
  path: '/main-app/test',
  component: () => import('./index.vue'),
} as RouteRecordRaw
