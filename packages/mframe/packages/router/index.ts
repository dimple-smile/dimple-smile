import { bus } from '@dimple-smile/mframe'

import Navigo from 'navigo'

const router = new Navigo('/')

const originalResolve = router.resolve
router.resolve = function (...args) {
  if (!args[0]) args[0] = location.href
  const result = originalResolve.apply(this, args)
  const containerBus = bus('container')
  if (!result) containerBus.data.set({ activeMicroAppName: '' })
  return result
}
export { router }
