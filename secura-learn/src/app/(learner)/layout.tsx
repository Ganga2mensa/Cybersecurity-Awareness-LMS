import { TopNav } from "@/components/shared/TopNav"
import { ThemeToggle } from "@/components/shared/ThemeToggle"

export default function LearnerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="flex items-center justify-between px-6 py-3 max-w-7xl mx-auto">
          <span className="text-xl font-bold text-foreground tracking-tight">
            SecuraLearn
          </span>
          <div className="flex items-center gap-2">
            <TopNav />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-auto p-8 bg-background text-foreground">
        {children}
      </main>
    </div>
  )
}
