import { reactive } from 'vue'
import mitt from 'mitt'

import { generateChannelData } from '../generator'

const channelName = 'container'

type NavItem = {
  label: string
  value: string
  [key: string]: any
}

type MenuItem = {
  label: string
  value: string
  [key: string]: any
}

type TabItem = {
  label: string
  value: string
  [key: string]: any
}

type MicroAppItem = {
  name: string
  origin: string
  activeRule: string
}

const channelData = reactive({
  /** 整个容器是否显示，默认为true，包括内容区域 */
  visible: undefined,

  /** 外框是否显示，默认为true，外框包括顶部导航栏，左侧菜单栏，tab标签栏 */
  frameVisible: undefined,

  /** 外框的顶部导航栏是否显示，默认为true，单独设置此项优先级高于frameVisible */
  navVisible: undefined,

  /** 外框的左侧菜单栏是否显示，默认为true，单独设置此项优先级高于frameVisible */
  menuVisible: undefined,

  /** 外框的tab标签栏是否显示，默认为true，单独设置此项优先级高于frameVisible */
  tabVisible: undefined,

  /** 子应用列表 */
  microApps: [] as MicroAppItem[],

  /** 当前激活的子应用名称 */
  activeMicroAppName: '',

  /** 顶部导航菜单项 */
  navItems: [] as NavItem[],

  activeNavItem: null,

  /** 左侧菜单项 */
  menuItems: [] as MenuItem[],
  activeMenuItem: null,

  /** 全量导航菜单项 */
  fullNavItems: [] as NavItem[],

  /** 标签内容项 */
  tabItems: [] as TabItem[],

  /** nav的BoundingClientRect信息 */
  navRect: { x: 0, y: 0, height: 0, width: 0 },

  /** menu的BoundingClientRect信息 */
  menuRect: { x: 0, y: 0, height: 0, width: 0 },

  /** tab的BoundingClientRect信息 */
  tabRect: { x: 0, y: 0, height: 0, width: 0 },

  /** mount的BoundingClientRect信息 */
  mountRect: { x: 0, y: 0, height: 0, width: 0 },

  /** microApp的置顶状态 */
  microAppStickStatus: false
})

type Event = {
  /** 顶部导航菜单项的点击事件 */
  navItemClick: any

  /** 左侧菜单项的点击事件 */
  menuItemClick: any

  /** 左侧菜单项的点击事件 */
  tabItemClick: any

  /** 左侧菜单项的点击事件 */
  tabItemClose: any

  /** 展开收起图标的点击事件 */
  collapseClick: any

  /** 子应用的加载事件 */
  microAppLoad: any

  /** 子应用从隐藏到显示的状态变化事件 */
  microAppShow: any
}

const channelItem = {
  data: generateChannelData<typeof channelData>(channelName, channelData),
  event: mitt<Event>(),
}

export const containerChannelItem = { container: channelItem }
export type ContainerChannelType = { container: typeof channelItem }
