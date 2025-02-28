import { default as cloneDeep } from 'lodash-es/cloneDeep'
const busChannelData: any = {}

let watches: any[] = []
const forceWatches = (payload: any, newData: any, oldData: any) => {
  watches.map((item) => {
    if (item.watchKeys?.length > 0 && Object.keys(payload).some((pItem) => item.watchKeys.includes(pItem))) {
      return item.cb(newData, oldData)
    }
    item.cb(newData, oldData)
  })
}

const genId = (n: number) =>
  [...Array(n)]
    .map(() => Math.random().toString(36)[2])
    .join('')
    .padEnd(n, '0')
    .slice(0, n)

const generateChannelData = <Data>(name: string, data: Data) => {
  busChannelData[name] = data

  const channelDataItem = {
    set: (
      payload: Partial<Data>,
      opt?: {
        /** 是否不合并数据，直接替换为传入的数据 */
        notMerge?: boolean
      },
    ) => {
      if (!payload) return
      if (typeof payload !== 'object') return
      const oldData = cloneDeep(busChannelData[name])
      const { notMerge = false } = opt || {}
      if (notMerge) {
        busChannelData[name] = payload as Data
      } else {
        Object.keys(payload || {}).map((key) => {
          busChannelData[name][key] = payload[key as keyof Data]
        })
      }
      forceWatches(payload, cloneDeep(busChannelData[name]), oldData)
    },
    get: (keys?: (keyof Data)[]): Data => {
      if (!(keys && keys.length > 0)) return busChannelData[name]
      let res: any = {}
      keys.map((key) => {
        res[key] = busChannelData[name]?.[key]
      })
      return res as Data
    },

    watch: (
      /** 数据变化的回调 */
      cb: (newData: Data, oldData: Data) => any,
      /** 只监听某些键的变化。默认会监听所有,在某些键值无法深层监听时有必要指定 */
      watchKeys?: (keyof Data)[],
    ) => {
      const id = genId(10)
      watches.push({ id, watchKeys: watchKeys || [], cb })
      return () => {
        watches = watches.filter((item) => item.id !== id)
      }
    },
  }

  return channelDataItem
}

export { generateChannelData }
