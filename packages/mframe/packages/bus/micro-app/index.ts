import * as postRobot from 'post-robot'
import { generateChannelData } from '../generator'
import type { MicroAppItem } from '../container/type'

type ParentListener = 'getMicroFrameRect' | 'reportRouter' | 'microAppStickStatus'
type ChildernListener = 'layoutDataChange' | 'syncRouter'

const channelName = 'microApp'

const sendToParent = async (key: ParentListener, data?: any) => {
  return postRobot
    .send(window.parent, key, data)
    .then((res) => [null, res.data])
    .catch((err) => [err, null])
}

const channelData = {
  appInfo: {} as MicroAppItem,
}
const channelItemData = generateChannelData<typeof channelData>(channelName, channelData)

const channelItem = {
  data: channelItemData,
  cors: {
    send: sendToParent,
    on: (name: ChildernListener, opt1?: any, opt2?: any) => postRobot.on(name, opt1, opt2),
    once: (name: ChildernListener, opt1?: any, opt2?: any) => postRobot.once(name, opt1, opt2),
  },
}

export const microAppChannelItem = { microApp: channelItem }
export type MicroAppChannelType = { microApp: typeof channelItem }
