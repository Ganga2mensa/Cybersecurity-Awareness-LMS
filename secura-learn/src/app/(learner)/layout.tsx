import { TopNav } from "@/components/shared/TopNav"

export default function LearnerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Top navigation bar */}
      <header className="border-b border-border bg-background">
        <div className="flex items-center justify-between px-6 py-3">
          {/* Brand */}
          <div className="text-xl font-bold text-foreground tracking-tight">
            SecuraLearn
          </div>

          {/* Navigation links */}
          <TopNav />
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-auto p-8">
        {children}
      </main>
    </div>
  )
}
