export type NavItem = {
  label: string
  value: string
  [key: string]: any
}

export type MenuItem = {
  label: string
  value: string
  [key: string]: any
}

export type TabItem = {
  label: string
  value: string
  [key: string]: any
}

/** 子应用状态 */
export type MicroAppStatus = {
  mounted?: boolean
  unmounted?: boolean
  activated?: boolean
  deactivated?: boolean
}

type RouterConfig = {
  /** 是否自动同步路由。默认自动同步 */
  sync?: Boolean

  /** 应用的路由模式。默认history，可以选值hash */
  mode?: 'history' | 'hash'
}

/** 子应用信息 */
export type MicroAppItem = {
  /** 子应用名称，唯一标识。 */
  name: string

  /** 子应用来源（协议、主机、端口） */
  origin: string

  /** 子应用路由激活的规则，唯一规则（注意不要和其他应用存在包含关系）。支持如 glob 语法，使用 picomatch 来匹配 */
  activeRule: string

  /** 作为子应用时，是否自动清除html、body、挂载点的背景颜色。默认清除，防止子应用的背景颜色覆盖主应用，但是会自动继到可用的布局容器中 */
  autoClearBackground?: Boolean

  /** 路由配置 */
  router?: RouterConfig

  [key: string]: any
}

/** 容器的初始化配置 */
export type ContainerInitOptions = {
  /** 容器类型。默认为microApp */
  type?: 'mainApp' | 'microApp'

  /** 应用挂载点。支持 #id，或者传入dom，默认值为#app。支持document.body或者其他dom */
  appendTo?: String | HTMLElement

  /** 路由配置 */
  router?: RouterConfig

  /** 子应用的列表。 */
  microApps?: MicroAppItem[]

  /** 作为子应用时，是否自动清除html、body、挂载点的背景颜色。默认清除，防止子应用的背景颜色覆盖主应用，但是会自动继到可用的布局容器中 */
  autoClearBackground?: Boolean
}

/** 容器初始化方法的结果 */
export type ContainerResult = {
  /** 顶部导航的挂载节点 */
  navDom: HTMLDivElement

  /** 左侧菜单的挂载节点 */
  menuDom: HTMLDivElement

  /** tab标签栏的挂载节点 */
  tabDom: HTMLDivElement

  /** 内容区的挂载节点 */
  mountDom: HTMLDivElement
}

/** 子应用容器初始化方法的结果 */
export type MicroAppContainerResult = Pick<ContainerResult, 'mountDom'>

/** 主应用的初始化配置 */
export type MainAppContainerInitOptions = Omit<ContainerInitOptions, 'type' | 'autoClearBackground'>

/** 子应用的初始化配置 */
export type MicroAppContainerInitOptions = Omit<ContainerInitOptions, 'type' | 'microApps' | 'router'>
