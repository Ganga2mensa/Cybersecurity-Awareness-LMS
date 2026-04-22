/**
 * Pure analytics calculation functions for Phase 5.
 * These are extracted for testability and reuse.
 */

/**
 * Calculate the organization-wide course completion rate.
 * @param completedEnrollments - Number of enrollments with completedAt set
 * @param totalEnrollments - Total number of enrollments
 * @returns Integer percentage in [0, 100]
 */
export function calculateOrgCompletionRate(
  completedEnrollments: number,
  totalEnrollments: number
): number {
  if (totalEnrollments === 0) return 0
  return Math.floor((completedEnrollments / totalEnrollments) * 100)
}

/**
 * Calculate the average phishing click rate across all attempts.
 * @param totalClicked - Number of phishing attempts where clicked = true
 * @param totalAttempts - Total number of phishing attempts
 * @returns Integer percentage in [0, 100]
 */
export function calculateAvgClickRate(
  totalClicked: number,
  totalAttempts: number
): number {
  if (totalAttempts === 0) return 0
  return Math.floor((totalClicked / totalAttempts) * 100)
}
