import { toRaw, watch, ref } from 'vue'

const busChannelData: any = {}
const generateChannelData = <Data>(name: string, data: Data) => {
  busChannelData[name] = ref(data)

  const channelDataItem = {
    set: (
      payload: Partial<Data>,
      opt?: {
        /**  */
        notMerge?: boolean
      },
    ) => {
      if (!payload) return
      if (typeof payload !== 'object') return
      const { notMerge = false } = opt || {}
      if (notMerge) return (busChannelData[name].value = payload)
      Object.keys(payload || {}).map((key) => {
        // @ts-ignore
        busChannelData[name].value[key] = payload[key]
      })
    },
    get: (keys?: (keyof Data)[]): Data => {
      const data = toRaw(busChannelData[name].value || {})
      if (!(keys && keys.length > 0)) return data
      let res: any = {}
      keys.map((key) => {
        res[key] = data?.[key]
      })
      return res as Data
    },

    watch: (
      /** 数据变化的回调 */
      cb: (newData: Data) => any,
      /** 只监听某些键的变化。默认会监听所有,在某些键值无法深层监听时有必要指定 */
      watchKeys?: (keyof Data)[],
    ) => {
      return watch(
        () => {
          if (!(watchKeys && watchKeys?.length > 0)) return busChannelData[name].value
          let res: any = {}
          watchKeys.map((key) => {
            res[key] = busChannelData[name].value[key]
          })
          console.log(res)
          return res
        },
        () => {
          let data = busChannelData[name].value
          let res: any = {}
          Object.keys(data).map((key) => {
            res[key] = toRaw(data[key])
          })
          return cb(res as Data)
        },
        { deep: true },
      )
    },
  }

  return channelDataItem
}

export { generateChannelData }
