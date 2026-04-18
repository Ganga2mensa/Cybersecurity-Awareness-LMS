import { SidebarNav } from "@/components/shared/SidebarNav"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 border-r border-border bg-background flex flex-col px-4 py-6">
        {/* Brand */}
        <div className="text-xl font-bold text-foreground tracking-tight px-2">
          SecuraLearn
        </div>

        {/* Navigation */}
        <SidebarNav />
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto p-8">
        {children}
      </main>
    </div>
  )
}
