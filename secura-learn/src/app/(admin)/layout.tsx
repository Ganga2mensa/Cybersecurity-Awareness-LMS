import { SidebarNav } from "@/components/shared/SidebarNav"
import { ThemeToggle } from "@/components/shared/ThemeToggle"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 border-r border-border bg-[#0F172A] dark:bg-[#0F172A] light:bg-[#0F172A] flex flex-col px-4 py-6">
        {/* Brand + theme toggle */}
        <div className="flex items-center justify-between px-2 mb-2">
          <span className="text-xl font-bold text-white tracking-tight">
            SecuraLearn
          </span>
          <ThemeToggle />
        </div>
        <SidebarNav />
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto p-8 bg-background text-foreground">
        {children}
      </main>
    </div>
  )
}
