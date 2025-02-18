import type { RouteRecordRaw } from 'vue-router'

export default {
  path: '/micro-app-2/test',
  component: () => import('./index.vue'),
} as RouteRecordRaw
