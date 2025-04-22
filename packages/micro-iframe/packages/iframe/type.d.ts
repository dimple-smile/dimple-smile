import type { createMainApp } from '@dimple-smile/micro-iframe'
export type IframeLifeCycleKey = 'registered' | 'loading' | 'activated' | 'deactivated' | 'destroy' | 'error'
export type CreateMainAppType = Parameters<typeof createMainApp>[0]
export type MicroAppInfo = CreateMainAppType['microApps'][number]
export type RouterConfig = CreateMainAppType['routerConfig']
export type CreateMicroIframeOptions = {
  /** SPA应用的根节点 */
  rootTarget: HTMLElement

  /** iframe主内容区的挂载点 */
  mainTarget: HTMLElement

  /** iframe的配置信息 */
  info: MicroAppInfo
}

export type RegisterOptions = Omit<CreateMicroIframeOptions, 'info'> & {
  /** 子应用列表 */
  microApps: MicroAppInfo[]
}
