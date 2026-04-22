"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useClerk } from "@clerk/nextjs"
import { LogOut } from "lucide-react"
import { cn } from "@/lib/utils"

const navLinks = [
  { label: "Dashboard", href: "/manager/dashboard" },
  { label: "Team Progress", href: "/manager/team" },
  { label: "Campaigns", href: "/manager/campaigns" },
  { label: "Profile", href: "/manager/profile" },
]

export function ManagerSidebarNav() {
  const pathname = usePathname()
  const router = useRouter()
  const { signOut } = useClerk()

  const handleSignOut = async () => {
    await signOut()
    router.push("/")
  }

  return (
    <nav className="flex flex-col gap-1 mt-6 flex-1">
      <div className="flex flex-col gap-1">
        {navLinks.map(({ label, href }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/")
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "inline-flex items-center justify-start w-full rounded-lg px-2.5 h-8 text-sm font-medium transition-colors",
                "text-slate-300 hover:text-white hover:bg-white/10",
                isActive && "bg-orange-500/20 text-orange-300 font-semibold"
              )}
            >
              {label}
            </Link>
          )
        })}
      </div>

      <div className="mt-auto pt-4 border-t border-white/10">
        <button
          onClick={handleSignOut}
          className="inline-flex items-center justify-start w-full rounded-lg px-2.5 h-8 text-sm font-medium transition-colors text-red-400 hover:text-red-300 hover:bg-red-500/10"
        >
          <LogOut className="mr-2 size-4" />
          Sign Out
        </button>
      </div>
    </nav>
  )
}
