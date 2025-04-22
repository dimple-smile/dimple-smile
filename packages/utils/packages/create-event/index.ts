type EventHandler<T = any> = (payload?: T) => void
type EventMap = Record<string, EventHandler>

const createEvent = <Events extends EventMap>() => {
  const events = new Map<keyof Events, EventHandler[]>()

  return {
    // 监听事件
    on<EventName extends keyof Events>(type: EventName, handler: Events[EventName]) {
      const handlers = events.get(type) || []
      handlers.push(handler)
      events.set(type, handlers)
    },

    // 取消监听
    off<EventName extends keyof Events>(type: EventName, handler?: Events[EventName]) {
      let handlers = events.get(type)
      if (!handlers) return
      if (!handler) return events.set(type, [])
      events.set(
        type,
        handlers.filter((item) => item !== handler),
      )
    },

    // 触发事件
    emit<EventName extends keyof Events>(type: EventName, payload?: Parameters<Events[EventName]>[0]) {
      const handlers = events.get(type)
      handlers?.forEach((handler) => handler(payload))
    },
  }
}

export { createEvent }
