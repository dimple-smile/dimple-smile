import { createDeferPromise } from '@dimple-smile/utils'

const loadingMap: { [key: string]: { value: boolean } & ReturnType<typeof createDeferPromise> } = {}

/** 通用的loading管理器，使用唯一key来进行get和set */
const useLoading = () => {
  return {
    set: (key: string, value: boolean) => {
      if (!loadingMap[key]) loadingMap[key] = { value: false, ...createDeferPromise() }
      loadingMap[key].value = value
      if (value === false && loadingMap[key].value === true) {
        loadingMap[key].resolve(false)
      }
      if (value === true && loadingMap[key].value === false) {
        loadingMap[key] = { value: true, ...createDeferPromise() }
      }
    },
    get: (key: string) => {
      if (!loadingMap[key]) return { value: false }
      return loadingMap[key]
    },
  }
}

export { useLoading }
