//@ts-nocheck

import { toRaw, watch, ref } from 'vue'
import isEqual from 'lodash-es/isEqual'
import deepmerge from 'deepmerge'

const busChannelData: any = {}
const generateChannelData = <Data>(name, data) => {
  const channelDataItem = {
    set: (
      payload: Partial<Data>,
      opt?: {
        notMerge?: boolean
        replaceMerge?: string | string[]
      },
    ) => {
      if (!payload) return
      if (typeof payload !== 'object') return
      const { notMerge = false, replaceMerge = [] } = opt || {}
      if (notMerge) return (busChannelData[name].value = payload)
      busChannelData[name].value = deepmerge(busChannelData[name].value, payload)
      if (Array.isArray(replaceMerge)) {
        replaceMerge.map((key) => {
          busChannelData[name].value[key] = payload[key]
        })
      }

      if (typeof replaceMerge === 'string') {
        busChannelData[name].value[replaceMerge] = payload[replaceMerge]
      }
    },
    get: (keys?: any[]): Data => {
      const data = toRaw(busChannelData[name]?.value || {})
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
      /** 只监听某些键的变化。默认会监听所有 */
      watchKeys?: string[],
    ) => {
      return watch(
        () => busChannelData[name].value,
        (newData, oldData) => {
          const newDataRaw = toRaw(newData)
          const oldDataRaw = toRaw(oldData)
          if (!(watchKeys && watchKeys.length > 0)) return cb(newDataRaw, oldDataRaw)
          const watchNewData: any = {}
          const watchOldData: any = {}
          watchKeys.forEach((key) => {
            watchNewData[key] = newDataRaw[key]
            watchOldData[key] = oldDataRaw[key]
          })
          if (isEqual(watchNewData, watchOldData)) return
          return cb(watchNewData, watchOldData)
        },
        { deep: true },
      )
    },
  }

  busChannelData[name] = ref(data)
  return channelDataItem
}

export { generateChannelData }
