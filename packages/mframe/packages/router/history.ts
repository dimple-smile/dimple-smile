const createHistoryCustomEvent = (type: keyof History) => {
  const original = window.history[type]
  return function (this: unknown) {
    const result = original.apply(this, arguments)
    const event = new Event(type)
    window.dispatchEvent(event)
    return result
  }
}

let hasInit = false
const initHistoryCustomEvent = (): void => {
  if (hasInit) return
  hasInit = true
  history.replaceState = createHistoryCustomEvent('replaceState')
  history.pushState = createHistoryCustomEvent('pushState')
}

export { initHistoryCustomEvent }
