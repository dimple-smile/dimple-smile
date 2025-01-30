import { containerChannelItem, type ContainerChannelType } from './container'
import { mainChannelItem, type MainAppChannelType } from './main-app'
import { microAppChannelItem, type MicroAppChannelType } from './micro-app'

type BusChannel = ContainerChannelType & MainAppChannelType & MicroAppChannelType

// @ts-ignore
const busChannel: BusChannel = {
  ...containerChannelItem,
  ...mainChannelItem,
  ...microAppChannelItem,
}

const bus = <T extends keyof BusChannel>(name: T): BusChannel[T] => {
  return busChannel[name] as BusChannel[T]
}

export { bus }
