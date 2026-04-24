import { SidebarNav } from "@/components/shared/SidebarNav"
import { ThemeToggle } from "@/components/shared/ThemeToggle"
import Link from "next/link"
import { KomorebiLogo } from "@/components/shared/KomorebiLogo"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      <aside className="w-64 shrink-0 border-r border-border bg-[#0F172A] flex flex-col px-4 py-6">
        <div className="flex items-center justify-between px-2 mb-4">
          <Link href="/admin/dashboard">
            <KomorebiLogo iconSize={26} />
          </Link>
          <ThemeToggle />
        </div>
        <SidebarNav />
      </aside>
      <main className="flex-1 overflow-auto p-8 bg-background text-foreground">
        {children}
      </main>
    </div>
  )
}
