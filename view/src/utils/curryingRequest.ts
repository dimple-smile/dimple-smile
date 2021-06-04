import axios from 'axios'
import type { AxiosRequestConfig, AxiosResponse } from 'axios'

// 柯里化处理，分离接口路径和请求时参数，并支持自定义错误处理
function curryingRequest(method: IMethod): (url: string, config?: AxiosRequestConfig) => Function {
  return (url: string, config?: AxiosRequestConfig): ((payload?: { params?: any }, onCustomRejected?: (error: any) => any) => Promise<AxiosResponse<any>>) => {
    return (payload?: { params?: any }, onCustomRejected?: (error: any) => any) => {
      if (!config) config = {}
      if (!payload) payload = {}
      if (method === 'get') {
        config.params = payload
      } else {
        const { params: postRequestParams, ...postRequestData } = payload
        config.params = postRequestParams || {}
        config.data = postRequestData || {}
      }
      return curryingRequest
        .axios({ ...config, method, url })
        .then((res: AxiosResponse) => res)
        .catch((error: any) => {
          if (onCustomRejected) onCustomRejected(error)
          return Promise.reject(error)
        })
    }
  }
}

curryingRequest.axios = axios
curryingRequest.get = curryingRequest('get')
curryingRequest.post = curryingRequest('post')
curryingRequest.put = curryingRequest('put')
curryingRequest.delete = curryingRequest('delete')

export default curryingRequest

export type IMethod = 'get' | 'post' | 'put' | 'delete'
export type IApiPayload = { url: string; config?: AxiosRequestConfig }
