export function calculateQuizScore(correctAnswers: number, totalQuestions: number): number {
  if (totalQuestions === 0) return 0
  return Math.round((correctAnswers / totalQuestions) * 100)
}

export function isQuizPassing(score: number, passingScore: number): boolean {
  return score >= passingScore
}
