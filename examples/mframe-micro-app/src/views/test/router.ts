import type { RouteRecordRaw } from 'vue-router'

export default {
  path: '/micro-app-1/test',
  component: () => import('./index.vue'),
} as RouteRecordRaw
