export const pollVariable = <T>(getDataFn: () => any, opt?: { interval: number; times: number }): Promise<T> => {
  const { interval = 50, times = 10 } = opt || {}
  return new Promise((resolve) => {
    let attempts = 0
    const checkExistence = () => {
      const result = getDataFn()
      if (result || attempts >= times) return resolve(result)
      attempts++
      setTimeout(checkExistence, interval)
    }
    checkExistence()
  })
}
