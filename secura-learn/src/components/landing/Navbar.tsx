import Link from "next/link"
import { Menu } from "lucide-react"
import { ThemeToggle } from "@/components/shared/ThemeToggle"

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-[#0F172A] dark:bg-[#0F172A] border-b border-white/10">
      {/* Brand */}
      <Link href="/" className="text-xl font-bold text-white tracking-tight">
        SecuraLearn
      </Link>

      {/* Desktop nav */}
      <div className="hidden md:flex items-center gap-3">
        <ThemeToggle />
        <Link
          href="/sign-in"
          className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
        >
          Sign In
        </Link>
        <Link
          href="/sign-up"
        className="inline-flex items-center justify-center rounded-lg px-3 h-7 text-sm font-medium bg-orange-500 text-white hover:bg-orange-400 transition-colors"
        >
          Get Started
        </Link>
      </div>

      {/* Mobile: theme toggle + hamburger */}
      <div className="md:hidden flex items-center gap-2">
        <ThemeToggle />
        <button
          className="text-slate-300 hover:text-white transition-colors"
          aria-label="Open menu"
        >
          <Menu className="size-6" />
        </button>
      </div>
    </nav>
  )
}
