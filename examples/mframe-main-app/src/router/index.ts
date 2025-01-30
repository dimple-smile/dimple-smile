import { createRouter, createWebHistory } from 'vue-router'

const routes: any[] = Object.values(
  import.meta.glob('../views/**/router.ts', { eager: true, import: 'default' }),
).flat()

const router = createRouter({ history: createWebHistory(), routes })

export { router }
