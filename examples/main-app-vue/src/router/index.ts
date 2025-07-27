import { createRouter, createWebHistory, createWebHashHistory } from 'vue-router'

const routes: any[] = Object.values(
  import.meta.glob('../views/**/router.ts', { eager: true, import: 'default' }),
).flat()

const router = createRouter({ history: createWebHashHistory(), routes })

export { router }
