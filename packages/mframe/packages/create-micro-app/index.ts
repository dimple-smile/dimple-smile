import { createContainer } from '@dimple-smile/mframe'

const createMicroApp = (opt?: {
  /** 支持 #id，或者传入dom，默认值为#app。支持document.body或者其他dom */
  appendTo?: String | HTMLElement
}) => {
  if (!opt) opt = {}

  const containerRes = createContainer({ type: 'microApp', ...opt })
  return { ...containerRes }
}

export { createMicroApp }
