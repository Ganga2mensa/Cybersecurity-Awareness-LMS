export function calculateAttemptRate(count: number, totalRecipients: number): number {
  if (totalRecipients === 0) return 0
  return Math.floor((count / totalRecipients) * 100)
}
