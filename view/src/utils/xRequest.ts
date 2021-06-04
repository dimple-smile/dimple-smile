import axios from 'axios'
import type { AxiosRequestConfig, AxiosResponse } from 'axios'

// 柯里化处理，分离接口路径和请求时参数，并支持自定义错误处理
function curryingRequest(method: 'get' | 'post' | 'put' | 'delete'): Function {
  return (url: string, config?: AxiosRequestConfig) => {
    return (payload?: any, onCustomRejected?: (error: any) => any) => {
      if (!config) config = {}
      if (!payload) payload = {}
      if (method === 'get') {
        config.params = payload
      } else {
        const { params: postRequestParams, ...postRequestData } = payload
        config.params = postRequestParams || {}
        config.data = postRequestData || {}
      }
      return curryingRequest.axios[method](url, config)
        .then((res: AxiosResponse) => res)
        .catch((error: any) => {
          if (onCustomRejected) onCustomRejected(error)
          return Promise.reject(error)
        })
    }
  }
}
curryingRequest.axios = axios

export default curryingRequest
