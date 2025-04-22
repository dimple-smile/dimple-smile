const createDeferPromise = () => {
  let resolve, reject
  const promise = new Promise<boolean>((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve: resolve as any, reject: reject as any }
}

const createElement = (
  tagName: keyof HTMLElementTagNameMap,
  props?: {
    attribute?: { [key: string]: any }
    style?: Partial<CSSStyleDeclaration>
  },
) => {
  const element = document.createElement(tagName)
  const { attribute = {}, style } = props || {}
  Object.keys(style || {}).map((key: any) => style?.[key] && (element.style[key] = style[key]))
  Object.keys(attribute).map((key: any) => element.setAttribute(key, attribute[key]))

  const { promise, resolve } = createDeferPromise()

  const elementStatus = new Proxy(
    { isMounted: false },
    {
      set: (_, prop, value) => {
        if (prop === 'isMounted' && value === true) resolve(true)
        return true
      },
    },
  )

  const checkMounted = async () => {
    if (elementStatus.isMounted) return true
    if (element.isConnected) return true
    return await promise
  }

  const listenerMap = new Map()
  const addEventListener = async (
    type: keyof WindowEventMap,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions,
  ) => {
    if (!listenerMap.get(type)) listenerMap.set(type, [])
    const listeners = listenerMap.get(type)
    listeners.push(listener)
    listenerMap.set(type, listeners)
    await checkMounted()
    element.addEventListener(type, listener, options)
  }

  const removeEventListener = async (type: keyof WindowEventMap) => {
    await checkMounted()
    listenerMap.forEach((listener, key) => {
      if (key === type) element.removeEventListener(type, listener)
    })
  }

  const setStyle = async (style: Partial<CSSStyleDeclaration>) => {
    await checkMounted()
    Object.entries(style).map(([key, value]) => {
      // @ts-ignore
      element.style[key] = value
    })
  }

  const setAttribute = async (attrs: { [key: string]: any }) => {
    await checkMounted()
    Object.entries(attrs).map(([key, value]) => element.setAttribute(key, value))
  }

  let currentVisible: boolean | undefined = undefined
  const setVisible = async (value?: boolean, transition?: number) => {
    await checkMounted()
    if (value === currentVisible) return
    const transitionTime = transition ?? 300
    if (transitionTime)
      element.style.transition = `opacity ${transitionTime}ms, visibility ${transitionTime}ms ${
        value ? 'step-start' : 'step-end'
      }`
    element.style.opacity = value ? '1' : '0'
    element.style.visibility = value ? 'visible' : 'hidden'
    currentVisible = value
  }

  const setPointerEvents = async (value?: boolean | string) => {
    if (value === null || value === undefined) return
    await checkMounted()
    let result = value
    if (typeof value === 'boolean') result = value ? 'all' : 'none'
    element.style.pointerEvents = result as string
  }

  const setMoMounted = () => {
    elementStatus.isMounted = true
  }

  const insertTo = (parentElement: HTMLElement, insertType?: 'append' | 'appendChild' | 'insertBefore') => {
    if (!parentElement) return
    // @ts-ignore
    parentElement[insertType || 'appendChild']?.(element)
    setMoMounted()
  }

  type ObserverMap = {
    MutationObserver: { callback: MutationCallback; options: MutationObserverInit }
    ResizeObserver: { callback: ResizeObserverCallback; options: ResizeObserverOptions }
  }

  const createObserver = async <T extends keyof ObserverMap>(
    type: T,
    callback: ObserverMap[T]['callback'],
    options?: ObserverMap[T]['options'],
  ) => {
    await checkMounted()
    if (type === 'MutationObserver') {
      return new MutationObserver(callback as MutationCallback).observe(element, options as MutationObserverInit)
    }
    if (type === 'ResizeObserver') {
      return new ResizeObserver(callback as ResizeObserverCallback).observe(element, options as ResizeObserverOptions)
    }
  }

  return {
    target: element as HTMLDivElement,
    setMoMounted,
    checkMounted,
    insertTo,
    addEventListener,
    removeEventListener,
    setStyle,
    setAttribute,
    setVisible,
    setPointerEvents,
    createObserver,
  }
}

export { createElement }
