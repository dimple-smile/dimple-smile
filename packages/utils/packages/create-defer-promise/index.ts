const createDeferPromise = () => {
  let resolve, reject
  const promise = new Promise<boolean>((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve: resolve as any, reject: reject as any }
}

export { createDeferPromise }
