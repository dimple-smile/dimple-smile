const extractBackground = (elements: HTMLElement[], opt?: { styleKeys?: string[] }) => {
  const { styleKeys = [] } = opt || {}
  const removedStyleKeys = [
    'background',
    'background-color',
    'background-image',
    'background-size',
    'background-position',
    'background-repeat',
    'background-attachment',
    'opacity',
    'box-shadow',
    'filter',
    ...styleKeys,
  ]
  const result = {}
  for (const element of elements) {
    const computedStyle = getComputedStyle(element)
    removedStyleKeys.map((key) => {
      // @ts-ignore
      result[key] = computedStyle[key]
    })
    removedStyleKeys.map((key: any) => {
      element.style[key] = 'none'
    })
  }
  return result
}

export { extractBackground }
