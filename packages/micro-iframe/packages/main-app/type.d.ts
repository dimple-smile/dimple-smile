export type ElementTarget = string | HTMLElement | Element | HTMLCollection | NodeList

export type RouterConfig = {
  /** 是否自动同步路由。默认自动同步 */
  sync?: Boolean

  /** 应用的路由模式。默认history，可以选值hash */
  mode?: 'history' | 'hash'
}

export type MicroApp = {
  /** 子应用id，唯一标识。 */
  id: string

  /** 子应用来源（协议、主机、端口） */
  origin: string

  /** 子应用路由激活的规则，唯一规则（注意不要和其他应用存在包含关系）,支持 glob 语法，如果不填，则需要手动激活&卸载子应用 */
  activeRule?: string

  /** 路由配置 */
  routerConfig?: RouterConfig

  /** iframe加载超时时间，默认值为10000ms */
  timeout?: number
}

export type CreateMainAppOptions = {
  /** SPA应用挂载点。支持 #id，或者传入dom，默认值为#app。支持document.body或者其他dom */
  root?: ElementTarget

  /** 主内容区挂载点。支持 #id，或者传入dom，默认值为#app。支持document.body或者其他dom */
  main?: ElementTarget

  /** 路由配置 */
  routerConfig?: RouterConfig

  /** 子应用列表。 */
  microApps: MicroApp[]
}