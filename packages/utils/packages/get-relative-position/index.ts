const getRelativePosition = (parentTarget: HTMLElement, childTarget: HTMLElement) => {
  const parentRect = parentTarget.getBoundingClientRect()
  const childRect = childTarget.getBoundingClientRect()

  return {
    top: childRect.top - parentRect.top,
    left: childRect.left - parentRect.left,
    width: childRect.width,
    height: childRect.height,
    // right: childRect.right - parentRect.left,
    // bottom: childRect.bottom - parentRect.top,
    // x: childRect.x - parentRect.x,
    // y: childRect.y - parentRect.y,
  }
}

export { getRelativePosition }
