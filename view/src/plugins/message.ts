import type { VNode } from 'vue'
function message(config: IMessageOptions | string) {}

export default message

export declare type IMessageOptions = {
  customClass?: string
  center?: boolean
  dangerouslyUseHTMLString?: boolean
  duration?: number
  iconClass?: string
  id?: string
  message?: string | VNode
  offset?: number
  onClose?: () => void
  showClose?: boolean
  type?: 'success' | 'warning' | 'info' | 'error' | ''
  zIndex?: number
}
