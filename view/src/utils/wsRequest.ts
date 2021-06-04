import { ElMessage } from 'element-plus'
import { destroy as destroyLoading } from './showLoading'

const accessTokenKey = 'accessToken'

const ws = new WebSocket(`${location.protocol.replace('http', 'ws')}//localhost:7001/ws`)

// 柯里化处理，分离接口路径和请求时参数，并支持自定义错误处理
export default (url: string) => {
  return (data?: any, onCustomRejected?: (error: any) => any) => {
    return new Promise((resolve, reject) => {
      const requestData = { url, data, token: localStorage.getItem(accessTokenKey) }

      const onSuccess = (e: MessageEvent) => {
        const res: WebSocketResponse = JSON.parse(e.data)
        if (res.status === 200) {
          resolve(res.data)
          return
        }
        onError(res)
        reject(res)
      }
      const onError = (error: any) => {
        destroyLoading()
        const msg = error.message || error.data
        if (msg) ElMessage.error(msg)
        if (onCustomRejected) onCustomRejected(error)
        ws.removeEventListener('message', onSuccess)
        ws.removeEventListener('error', onError)
      }

      if (ws.readyState) {
        ws.send(JSON.stringify(requestData))
        ws.addEventListener('message', onSuccess)
        ws.addEventListener('error', onError)
      } else {
        ws.onopen = () => {
          console.log('ws连接成功')
          ws.send(JSON.stringify(requestData))
          ws.addEventListener('message', onSuccess)
          ws.addEventListener('error', onError)
        }
      }
    })
  }
}

type WebSocketResponse = {
  status: number
  data: any
  message?: string
}
