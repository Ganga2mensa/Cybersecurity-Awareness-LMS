import Link from 'next/link'

export default function Forbidden() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-center px-6 bg-background text-foreground">
      <h1 className="text-4xl font-bold">403 — Access Denied</h1>
      <p className="text-muted-foreground max-w-md">
        You don&apos;t have permission to access this page. Please sign in with
        an account that has the required role.
      </p>
      <div className="flex gap-3">
        <Link
          href="/sign-in"
          className="inline-flex items-center justify-center rounded-lg px-6 h-9 text-sm font-medium bg-orange-500 text-white hover:bg-orange-400 transition-colors"
        >
          Sign In
        </Link>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-lg px-6 h-9 text-sm font-medium border border-border text-foreground hover:bg-muted transition-colors"
        >
          Return to Home
        </Link>
      </div>
    </div>
  )
}
