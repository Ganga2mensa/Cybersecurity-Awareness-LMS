export type UserRole = 'ADMIN' | 'LEARNER'

export interface UserGreetingProps {
  userName: string | null
  orgName: string | null
}
