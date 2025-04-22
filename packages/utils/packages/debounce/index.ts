const debounce = (fn: any, delay: number, immediate = false) => {
  let timer: any = null

  return function (this: any, ...args: any[]) {
    const context = this
    if (timer) clearTimeout(timer)
    if (immediate && !timer) {
      fn.apply(context, args)
    }

    timer = setTimeout(() => {
      timer = null
      if (!immediate) {
        fn.apply(context, args)
      }
    }, delay)
  }
}

export { debounce }
