import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { Menu } from "lucide-react"
import { cn } from "@/lib/utils"

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-[#0F172A] border-b border-white/10">
      {/* Brand */}
      <Link href="/" className="text-xl font-bold text-white tracking-tight">
        SecuraLearn
      </Link>

      {/* Desktop nav */}
      <div className="hidden md:flex items-center gap-4">
        <Link
          href="/sign-in"
          className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
        >
          Sign In
        </Link>
        <Link
          href="/sign-up"
          className={cn(buttonVariants({ size: "sm" }))}
        >
          Get Started
        </Link>
      </div>

      {/* Mobile hamburger — visible only on small screens */}
      <button
        className="md:hidden text-slate-300 hover:text-white transition-colors"
        aria-label="Open menu"
      >
        <Menu className="size-6" />
      </button>
    </nav>
  )
}
