import mitt from 'mitt'

import { generateChannelData } from '../generator'

import type { MicroAppItem, MicroAppStatus, MenuItem, NavItem, TabItem, ContainerInitOptions } from './type'

const channelName = 'container'

const channelData = {
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

  /** 内容区是否显示，默认为true，单独设置此项优先级高于visible */
  mountVisible: undefined,

  /** 子应用列表 */
  microApps: [] as MicroAppItem[],

  /** 当前激活的子应用名称 */
  activeMicroAppName: '',

  /** 当前激活的子应用信息 */
  activeMicroAppItem: null,

  /** 顶部导航菜单项列表 */
  navItems: [] as NavItem[],

  /** 当前激活的顶部导航菜单项 */
  activeNavItem: null,

  /** 左侧菜单项列表 */
  menuItems: [] as MenuItem[],

  /** 当前激活左侧菜单项 */
  activeMenuItem: null,

  /** 全量导航菜单项 */
  fullNavItems: [] as NavItem[],

  /** 标签内容项列表 */
  tabItems: [] as TabItem[],

  /** 当前激活的标签内容项 */
  activeTabItem: null,

  /** nav的BoundingClientRect信息 */
  navRect: { x: 0, y: 0, height: 0, width: 0 },

  /** menu的BoundingClientRect信息 */
  menuRect: { x: 0, y: 0, height: 0, width: 0 },

  /** tab的BoundingClientRect信息 */
  tabRect: { x: 0, y: 0, height: 0, width: 0 },

  /** mount的BoundingClientRect信息 */
  mountRect: { x: 0, y: 0, height: 0, width: 0 },

  /** 子应用的置顶状态。子应用处于置顶时，主应用将无法触发外框的事件。 */
  microAppStickStatus: false,

  /** 容器创建时的初始化配置 */
  initOptions: {} as ContainerInitOptions,
}

type Event = {
  /** 容器组件onMounted生命周期 */
  onMounted: any

  /** 容器组件内布局容器onMounted生命周期 */
  onLayoutMounted: any

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
}

const channelItemData = generateChannelData<typeof channelData>(channelName, channelData)

const channelItem = {
  data: channelItemData,
  event: mitt<Event>(),
  expose: {
    /** 获取布局相关的数据key */
    getLayoutDataKeys: (): any[] => {
      return [
        'visible',
        'frameVisible',
        'navVisible',
        'menuVisible',
        'tabVisible',
        'mountVisible',
        'navRect',
        'menuRect',
        'tabRect',
        'mountRect',
      ]
    },
  },
}

export const containerChannelItem = { container: channelItem }
export type ContainerChannelType = { container: typeof channelItem }
