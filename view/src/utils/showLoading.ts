import { ElLoading } from 'element-plus'
import type { ILoadingOptions, ILoadingInstance } from 'element-plus/packages/loading/src/loading.type'

const loadingInstances: Set<ILoadingInstance> = new Set()
export default (options: IMyLoadingOptions = {}) => {
  const loadingInstance = ElLoading.service({
    target: options.target || 'document.body',
    fullscreen: options.fullscreen || true,
    lock: options.lock || true,
    text: options.text || '',
    spinner: 'el-icon-loading',
    background: options.background || 'rgba(0,0,0,.3)',
  })
  if (!loadingInstances.has(loadingInstance)) loadingInstances.add(loadingInstance)
  return {
    hide: () => {
      loadingInstance.close()
      loadingInstances.delete(loadingInstance)
    },
  }
}
export const destroy = () => {
  for (const item of loadingInstances.values()) {
    item.close()
  }
  loadingInstances.clear()
}

export interface IMyLoadingOptions extends ILoadingOptions {
  target?: string | HTMLElement | any
}
