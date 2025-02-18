import { toRaw, watch, ref, markRaw } from 'vue'
import isEqual from 'lodash-es/isEqual'

const busChannelData: any = {}
const generateChannelData = <Data>(name, data) => {
  busChannelData[name] = ref(data)

  const channelDataItem = {
    set: (
      payload: Partial<Data>,
      opt?: {
        notMerge?: boolean
      },
    ) => {
      if (!payload) return
      if (typeof payload !== 'object') return
      const { notMerge = false } = opt || {}
      if (notMerge) return (busChannelData[name].value = payload)
      Object.keys(payload || {}).map((key) => {
        busChannelData[name].value[key] = payload[key]
      })
    },
    get: (keys?: (keyof Data)[]): Data => {
      const data = busChannelData[name].value || {}
      if (!(keys && keys.length > 0)) return data
      let res = {}
      keys.forEach((key) => {
        res[key] = data?.[key]
      })
      return res as Data
    },

    watch: (
      /** 数据变化的回调 */
      cb: (newData: Data, oldData: Data) => any,
      /** 只监听某些键的变化。默认会监听所有,在某些键值无法深层监听时有必要指定 */
      watchKeys?: (keyof Data)[],
    ) => {
      return watch(
        () => {
          if (!(watchKeys && watchKeys?.length > 0)) return busChannelData[name].value
          let res = {}
          watchKeys.map((key) => {
            res[key] = busChannelData[name].value[key]
          })
          return res
        },
        cb,
        { deep: true },
      )
    },
  }

  return channelDataItem
}

export { generateChannelData }
