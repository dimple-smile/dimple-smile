import * as postRobot from 'post-robot'
import mitt from 'mitt'
import { generateChannelData } from '../generator'

type ParentListener = 'getMicroFrameRect' | 'reportRouter' | 'microAppStickStatus'
type ChildernListener = 'layoutDataChange' | 'syncRouter'

type Event = {
  /** 子应用上报路由信息事件 */
  reportRouter: any
}

type microAppsDataItem = { name: string; contentWindow: Window; [key: string]: any }

const microAppsData: microAppsDataItem[] = []
const connectMicroApp = async (opt: microAppsDataItem) => {
  microAppsData.push(opt)
}

const sendToChild = async (microAppName: string, key: ChildernListener, data?: any) => {
  const microAppDataItem = microAppsData.find((item) => item.name === microAppName)
  if (!microAppDataItem) return [{ msg: 'microApp not exit' }, null]
  return postRobot
    .send(microAppDataItem.contentWindow, key, data)
    .then((res) => [null, res.data])
    .catch((err) => [err, null])
}

const channelName = 'mainApp'

const channelData = {}
const channelItemData = generateChannelData<typeof channelData>(channelName, channelData)

const channelItem = {
  data: channelItemData,
  cors: {
    send: sendToChild,
    on: (name: ParentListener, opt1: any, opt2?: any) => postRobot.on(name, opt1, opt2),
    once: (name: ParentListener, opt1: any, opt2?: any) => postRobot.once(name, opt1, opt2),
  },
  expose: {
    connectMicroApp,
  },
  event: mitt<Event>(),
}

export const mainChannelItem = { mainApp: channelItem }
export type MainAppChannelType = { mainApp: typeof channelItem }
