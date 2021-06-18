import type { RouteRecordRaw } from 'vue-router'

const route: RouteRecordRaw[] = [
  {
    path: '/template',
    component: () => import('./App.vue'),
  },
]

export default route
