import curryingRequest from './curryingRequest'
import axios from 'axios'
import type { AxiosRequestConfig, AxiosResponse } from 'axios'
import { destroy as destroyLoading } from './showLoading'

// 接口前缀
const baseURL = import.meta.env.VITE_BASE_URL
// 请求超时时间 ms
const timeout = 5 * 60 * 1000
// 认证接口
const authenticationUrl = '/auth'
// 授权接口白名单
const authorizationWhiteList = ['/auth']
// 默认token过期时间
const defaultExpirationTime = 2 * 60 * 60 * 1000
// localStorage key
const accessTokenKey = 'accessToken'
const refreshTokenKey = 'refreshToken'
const expirationAtKey = 'expirationAt'

// 获取接口鉴权需要的token
const getToken = async (url: string | undefined) => {
  if (!url || !localStorage.getItem(refreshTokenKey)) return
  if (authorizationWhiteList.includes(url)) return localStorage.getItem(accessTokenKey)
  const expirationAt = Number(localStorage.getItem(expirationAtKey)) || new Date()
  if (expirationAt > new Date().getTime()) return localStorage.getItem(accessTokenKey)
  try {
    const res = await axios({
      baseURL,
      method: 'post',
      url: authenticationUrl,
      data: {
        grant_type: 'refresh_token',
        access_token: localStorage.getItem(accessTokenKey),
        refresh_token: localStorage.getItem(refreshTokenKey),
      },
    })
    const data = (res && res.data) || {}
    setToken(data)
    return data.access_token
  } catch (error) {
    return
  }
}

// 存储token信息
export const setToken = (data: any) => {
  const { accessToken, refreshToken, expirationTime } = data
  localStorage.setItem(accessTokenKey, accessToken)
  localStorage.setItem(refreshTokenKey, refreshToken)
  localStorage.setItem(expirationAtKey, new Date().getTime() + expirationTime || defaultExpirationTime)
}

// 删除token信息
export const removeToken = () => {
  localStorage.removeItem(accessTokenKey)
  localStorage.removeItem(refreshTokenKey)
  localStorage.removeItem(expirationAtKey)
}

// 请求拦截器
const onRequest = async (config: AxiosRequestConfig) => {
  config.baseURL = baseURL
  config.timeout = timeout
  config.headers.token = await getToken(config.url)
  return config
}

// 响应拦截器
const onSuccess = (res: AxiosResponse) => {
  return res.data
}

// 错误拦截器
const onError = (error: any, onCustomRejected?: (error: any) => any) => {
  destroyLoading()
  // 1. http 状态码非2开头（没有额外定义 validateStatus）的都会进来这里，如 404, 500 等
  // 2. 取消请求也会进入这里，可以用 axios.isCancel(error) 来判断是否是取消请求，error 的数据结构如下：cancel-error
  // 3. 请求运行有异常也会进入这里，如故意将 headers 写错：axios.defaults.headers = '123'
  // 4. 断网，error 的数据结构如下：network-error
  if (error.response) {
    // 请求已发出，服务器返回的 http 状态码不是 2xx，例如：400，500，对应上面的 1
    // 400 参数校验错误
    // 业务代码待实现
    // 401 认证错误
    // 业务代码待实现
    // 403 鉴权错误
    // 业务代码待实现
    console.info(error.response)
  } else if (error.request) {
    // 请求已发出，但没有收到响应，例如：断网，对应上面的 4
    console.info(error)
  } else {
    // 请求被取消或者发送请求时异常，对应上面的 2 & 3
    console.info('error', error.message)
  }
  if (onCustomRejected) onCustomRejected(error)

  return Promise.reject(error)
}
// 添加请求拦截器
curryingRequest.axios.interceptors.request.use(onRequest, error => Promise.reject(error))
// 添加响应拦截器
curryingRequest.axios.interceptors.response.use(onSuccess, onError)

export default curryingRequest
