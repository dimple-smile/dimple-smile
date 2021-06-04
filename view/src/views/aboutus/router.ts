import { RouteRecordRaw } from 'vue-router'

const router: RouteRecordRaw[] = [
  {
    name:'aboutus',
    path: '/aboutus',
    component: () => import('./App.vue'),
  }
]
export default router
