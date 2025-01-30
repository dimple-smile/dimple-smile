import { watch } from 'vue'

import { createMicroApp as createDasMicroApp, syncRouter, reportRouter } from '@dimple-smile/mframe'

import type { Router } from 'vue-router'

const createMicroApp = (opt: { router: Router }) => {
  const { mountDom } = createDasMicroApp()

  const { router } = opt

  syncRouter((e) => {
    const { url, hashString } = e.route
    if (url.startsWith('#')) {
      router.push(hashString)
    }else{
      router.push('/'+ url)
    }
  })

  watch(
    () => router.currentRoute.value,
    (newRoute) => {
      reportRouter({ path: newRoute.fullPath })
    },
  )

  return { mountDom }
}

export { createMicroApp }
