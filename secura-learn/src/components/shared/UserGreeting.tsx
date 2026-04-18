import type { UserGreetingProps } from '@/types'

export function UserGreeting({ userName, orgName }: UserGreetingProps) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold text-foreground">
        Welcome back, {userName ?? 'User'}
      </h1>
      <p className="text-muted-foreground mt-1">
        Organization: {orgName ?? 'Unknown Organization'}
      </p>
    </div>
  )
}
