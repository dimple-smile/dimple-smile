import App from './App.vue'

import type { RouteRecordRaw } from 'vue-router'

export default [
  { path: '/', name: 'root', redirect: '/home' },
  { path: '/home', name: 'home', component: App },
] as RouteRecordRaw[]
