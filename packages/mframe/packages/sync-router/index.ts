import { ref, watch } from 'vue'
import { bus } from '@dimple-smile/mframe'
import type { Match } from 'navigo'

let currentMicroAppInfo = {}

const onLoading = ref(true)
const syncRouter = (cb: (params: { appInfo: any; route: Match }) => any) => {
  const microAppBus = bus('microApp')

  microAppBus.cors.on('syncRouter', (e) => {
    const { data } = e
    currentMicroAppInfo = data.appInfo
    cb(data)
    onLoading.value = false
  })
}

const reportRouter = async (data: {
  /** 路由模式。默认history */
  type?: 'history'
  /** 路由地址 */
  path: string
}) => {
  if (onLoading.value) await new Promise((res) => watch(() => onLoading.value, res))
  let { path } = data || {}
  if (!path) return
  const microAppBus = bus('microApp')
  if (!path?.startsWith('/')) path = '/' + path
  microAppBus.cors.send('reportRouter', { ...data, path, href: location.href, appInfo: currentMicroAppInfo })
}

export { syncRouter, reportRouter }
