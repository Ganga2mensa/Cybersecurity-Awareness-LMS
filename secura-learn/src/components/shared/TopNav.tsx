"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useClerk } from "@clerk/nextjs"
import { LogOut } from "lucide-react"
import { cn } from "@/lib/utils"

const navLinks = [
  { label: "My Courses", href: "/learner/courses" },
  { label: "Badges", href: "/learner/badges" },
  { label: "Progress", href: "/learner/progress" },
  { label: "Profile", href: "/learner/profile" },
]

export function TopNav() {
  const pathname = usePathname()
  const router = useRouter()
  const { signOut } = useClerk()

  const handleSignOut = async () => {
    await signOut()
    router.push("/")
  }

  return (
    <nav className="flex items-center gap-1">
      {navLinks.map(({ label, href }) => {
        const isActive = pathname === href || pathname.startsWith(href + "/")
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "inline-flex items-center rounded-lg px-2.5 h-8 text-sm font-medium transition-colors",
              "text-muted-foreground hover:text-foreground hover:bg-muted",
              isActive && "bg-orange-500/10 text-orange-600 dark:text-orange-400 font-semibold"
            )}
          >
            {label}
          </Link>
        )
      })}

      <button
        onClick={handleSignOut}
        className="inline-flex items-center rounded-lg px-2.5 h-8 text-sm font-medium transition-colors text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 dark:hover:text-red-400 ml-2"
      >
        <LogOut className="mr-2 size-4" />
        Sign Out
      </button>
    </nav>
  )
}
