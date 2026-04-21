export function reorderItems<T extends { order: number }>(items: T[], fromIndex: number, toIndex: number): T[] {
  const result = [...items]
  const [moved] = result.splice(fromIndex, 1)
  result.splice(toIndex, 0, moved)
  return result.map((item, index) => ({ ...item, order: index + 1 }))
}
