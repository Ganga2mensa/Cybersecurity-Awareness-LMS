"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { SignOutButton } from "@clerk/nextjs"
import { LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

const navLinks = [
  { label: "Dashboard", href: "/admin/dashboard" },
  { label: "Courses", href: "/admin/courses" },
  { label: "Users", href: "/admin/users" },
  { label: "Phishing Campaigns", href: "/admin/campaigns" },
  { label: "Analytics", href: "/admin/analytics" },
]

export function SidebarNav() {
  const pathname = usePathname()

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
                buttonVariants({ variant: "ghost", size: "default" }),
                "justify-start w-full",
                isActive && "bg-muted text-foreground font-semibold"
              )}
            >
              {label}
            </Link>
          )
        })}
      </div>
      
      {/* Logout button at the bottom */}
      <div className="mt-auto pt-4 border-t border-border">
        <SignOutButton>
          <button
            className={cn(
              buttonVariants({ variant: "ghost", size: "default" }),
              "justify-start w-full text-destructive hover:text-destructive hover:bg-destructive/10"
            )}
          >
            <LogOut className="mr-2 size-4" />
            Sign Out
          </button>
        </SignOutButton>
      </div>
    </nav>
  )
}
