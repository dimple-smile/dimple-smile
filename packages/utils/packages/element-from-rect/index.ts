type Rect = { x: number; y: number; width: number; height: number }
type DetectionMethod = 'diagonal' | 'crosshair'
type Point = [number, number]
type Options = {
  expand?: number
  /**
   * 采样步长（像素）
   * @default 10
   */
  step?: number
  /**
   * 检测路径方法
   * @default ['diagonal','crosshair']
   */
  methods?: DetectionMethod[]

  /**
   * 是否包含边缘
   * @default false
   */
  includeEdges?: boolean

  /**
   * 排除的元素
   * @default [document.body,document.documentElement]
   */
  excludeElements?: HTMLElement[]
}

const elementFromRect = (rect: Rect, options?: Options) => {
  const { excludeElements = [] } = options || {}
  const points = generateSamplingPoints(rect, options)

  let res = points.map(([x, y]) => document.elementFromPoint(x, y)).flat()
  res = [...new Set(res)]
    .filter((item) => ![document.body, document.documentElement, ...excludeElements].includes(item as HTMLElement))
    .filter((item) => excludeElements.every((eItem) => !eItem.contains(item)))
  res = res.filter((el) => {
    return !res.some((otherEl) => otherEl !== el && otherEl?.contains(el))
  })
  return res
}

const generateSamplingPoints = (rect: Rect, options?: Options): Point[] => {
  const { methods = ['diagonal', 'crosshair'], step = 10, includeEdges = false } = options || {}

  const { x, y, width, height } = rect
  let points: Point[] = []

  if (methods.includes('diagonal')) {
    // 双对角线采样（Bresenham算法 主+副）
    const diagSteps = Math.ceil(Math.sqrt(width ** 2 + height ** 2) / step)
    for (let i = 0; i <= diagSteps; i++) {
      const t = i / diagSteps
      // 主对角线（左上→右下）
      points.push([x + width * t, y + height * t])
      // 副对角线（右上→左下）
      points.push([x + width * (1 - t), y + height * t])
    }
  }

  // 中心十字线采样
  if (methods.includes('crosshair')) {
    for (let p = x; p <= x + width; p += step) points.push([p, y + height / 2])
    for (let q = y; q <= y + height; q += step) points.push([x + width / 2, q])
  }

  points = points.map(([x, y]) => [Number(x.toFixed(0)), Number(y.toFixed(0))])

  if (!includeEdges) {
    points = points.filter(([px, py]) => px > x && px < x + width && py > y && py < y + height)
  }

  return [...new Set(points.map((p) => p.join()))].map((s) => s.split(',').map(Number) as Point)
}

export { elementFromRect }
