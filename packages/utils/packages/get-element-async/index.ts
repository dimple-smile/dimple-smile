const getElementAsync = (
  target: string | HTMLElement | Element | HTMLCollection | NodeList,
  options?: {
    timeout: number
  },
): Promise<HTMLElement | null> => {
  const { timeout = 10000 } = options || {}
  return new Promise((resolve) => {
    const startTime = Date.now()
    const check = () => {
      let element: HTMLElement | Element | Node | null = null
      if (typeof target === 'string') element = document.getElementById(target.replace('#', ''))
      if (target instanceof HTMLElement) element = target
      if (target instanceof Element) element = target
      if (target instanceof HTMLCollection) element = target[0]
      if (target instanceof NodeList) element = target[0]
      if (element?.isConnected) return resolve(element as HTMLElement)
      if (Date.now() - startTime >= timeout) return resolve(null)
      requestAnimationFrame(check)
    }
    check()
  })
}

export { getElementAsync }
