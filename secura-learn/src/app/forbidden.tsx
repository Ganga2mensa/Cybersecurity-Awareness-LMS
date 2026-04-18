import Link from 'next/link'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'

export default function Forbidden() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-center px-6">
      <h1 className="text-4xl font-bold">403 — Access Denied</h1>
      <p className="text-muted-foreground max-w-md">
        You don&apos;t have permission to access this page. Please sign in with
        an account that has the required role.
      </p>
      <div className="flex gap-3">
        <Link href="/sign-in" className={cn(buttonVariants())}>
          Sign In
        </Link>
        <Link href="/" className={cn(buttonVariants({ variant: 'outline' }))}>
          Return to Home
        </Link>
      </div>
    </div>
  )
}
