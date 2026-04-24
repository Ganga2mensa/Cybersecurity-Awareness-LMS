import { TopNav } from "@/components/shared/TopNav"
import { ThemeToggle } from "@/components/shared/ThemeToggle"
import Link from "next/link"
import { KomorebiLogo } from "@/components/shared/KomorebiLogo"

export default function LearnerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="flex items-center justify-between px-6 py-2 max-w-7xl mx-auto">
          <Link href="/learner/dashboard">
            <KomorebiLogo iconSize={26} textColor="text-foreground" />
          </Link>
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
