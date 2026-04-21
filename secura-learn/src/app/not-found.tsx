import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-center px-6 bg-background text-foreground">
      <h1 className="text-4xl font-bold">404 — Page Not Found</h1>
      <p className="text-muted-foreground max-w-md">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/"
        className="inline-flex items-center justify-center rounded-lg px-6 h-9 text-sm font-medium bg-orange-500 text-white hover:bg-orange-400 transition-colors"
      >
        Return to Home
      </Link>
    </div>
  )
}
