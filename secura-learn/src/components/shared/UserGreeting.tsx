import type { UserGreetingProps } from '@/types'

export function UserGreeting({ userName, orgName }: UserGreetingProps) {
  return (
    <div className="mb-6 pb-6 border-b border-border">
      <h1 className="text-2xl font-bold text-foreground">
        Welcome back,{' '}
        <span className="text-orange-500 dark:text-orange-400">
          {userName ?? 'User'}
        </span>
      </h1>
      <p className="text-muted-foreground mt-1 text-sm">
        Organization:{' '}
        <span className="font-medium text-foreground">
          {orgName ?? 'Unknown Organization'}
        </span>
      </p>
    </div>
  )
}
