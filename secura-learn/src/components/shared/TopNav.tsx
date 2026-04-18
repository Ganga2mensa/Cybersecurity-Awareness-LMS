"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { SignOutButton } from "@clerk/nextjs"
import { LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

const navLinks = [
  { label: "My Courses", href: "/learner/courses" },
  { label: "Badges", href: "/learner/badges" },
  { label: "Progress", href: "/learner/progress" },
]

export function TopNav() {
  const pathname = usePathname()

  return (
    <nav className="flex items-center gap-1">
      {navLinks.map(({ label, href }) => {
        const isActive = pathname === href || pathname.startsWith(href + "/")
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              buttonVariants({ variant: "ghost", size: "default" }),
              isActive && "bg-muted text-foreground font-semibold"
            )}
          >
            {label}
          </Link>
        )
      })}
      
      {/* Logout button */}
      <SignOutButton>
        <button
          className={cn(
            buttonVariants({ variant: "ghost", size: "default" }),
            "text-destructive hover:text-destructive hover:bg-destructive/10 ml-2"
          )}
        >
          <LogOut className="mr-2 size-4" />
          Sign Out
        </button>
      </SignOutButton>
    </nav>
  )
}
