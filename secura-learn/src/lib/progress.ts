export function calculateProgressPercentage(completedLessons: number, totalLessons: number): number {
  if (totalLessons === 0) return 0
  return Math.floor((completedLessons / totalLessons) * 100)
}
