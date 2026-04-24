"use client"

import Link from "next/link"
import { useState, useRef } from "react"
import { ChevronDown, X, UserCircle, ShieldCheck } from "lucide-react"
import { ThemeToggle } from "@/components/shared/ThemeToggle"
import { KomorebiLogo } from "@/components/shared/KomorebiLogo"

// ─── Mega menu data ───────────────────────────────────────────────────────────

const megaMenus = {
  Platform: {
    columns: [
      {
        heading: "PLATFORM",
        links: [
          { label: "The SecuraLearn Platform", href: "/get-started" },
        ],
      },
      {
        heading: "SECURITY AWARENESS TRAINING",
        links: [
          { label: "Security Awareness Training", href: "/#capabilities" },
          { label: "Phishing Simulations", href: "/#how-it-works" },
          { label: "Quiz & Assessments", href: "/#capabilities" },
          { label: "SCORM Content", href: "/#capabilities" },
        ],
      },
      {
        heading: "ANALYTICS & REPORTING",
        links: [
          { label: "Risk Dashboard", href: "/#capabilities" },
          { label: "Campaign Reports", href: "/#capabilities" },
          { label: "Completion Tracking", href: "/#capabilities" },
        ],
      },
      {
        heading: "COMPLIANCE",
        links: [
          { label: "Compliance Training", href: "/#capabilities" },
          { label: "Policy Management", href: "/#capabilities" },
          { label: "Audit Readiness", href: "/#capabilities" },
        ],
      },
    ],
    featured: {
      title: "Human Ready. AI Ready.",
      description:
        "From social engineering to advanced phishing, protect your people with SecuraLearn's end-to-end security awareness platform.",
      cta: "Secure Your Workforce",
      href: "/get-started",
    },
  },
  "Free Tools": {
    columns: [
      {
        heading: "FREE TOOLS",
        links: [
          { label: "Free Phishing Simulation", href: "/sign-up" },
          { label: "Security Awareness Program Builder", href: "/sign-up" },
          { label: "Training Content Preview", href: "/sign-up" },
        ],
      },
      {
        heading: "RESOURCES",
        links: [
          { label: "Why Choose SecuraLearn", href: "/#stats" },
          { label: "How It Works", href: "/#how-it-works" },
          { label: "Industry Recognition", href: "/#recognition" },
          { label: "Customer Testimonials", href: "/#recognition" },
        ],
      },
    ],
    featured: {
      title: "Start for Free",
      description:
        "No credit card required. Get access to phishing simulations, course previews, and your security risk score instantly.",
      cta: "Get Started Free",
      href: "/sign-up",
    },
  },
  Solutions: {
    columns: [
      {
        heading: "BY TEAM",
        links: [
          { label: "IT Teams", href: "/#roles" },
          { label: "Security Teams", href: "/#roles" },
          { label: "Compliance & Privacy", href: "/#roles" },
          { label: "HR & People Teams", href: "/#roles" },
        ],
      },
      {
        heading: "BY INDUSTRY",
        links: [
          { label: "Financial Services", href: "/get-started" },
          { label: "Healthcare", href: "/get-started" },
          { label: "Education", href: "/get-started" },
          { label: "Government", href: "/get-started" },
        ],
      },
    ],
    featured: {
      title: "Built for Every Organization",
      description:
        "Whether you're a 10-person startup or a 10,000-person enterprise, SecuraLearn scales to fit your security awareness needs.",
      cta: "Find Your Solution",
      href: "/get-started",
    },
  },
}

type MenuKey = keyof typeof megaMenus

// ─── Component ────────────────────────────────────────────────────────────────

export function Navbar() {
  const [activeMenu, setActiveMenu] = useState<MenuKey | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const openMenu = (key: MenuKey) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setActiveMenu(key)
  }

  const closeMenu = () => {
    timeoutRef.current = setTimeout(() => setActiveMenu(null), 150)
  }

  const cancelClose = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
  }

  const menu = activeMenu ? megaMenus[activeMenu] : null

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      {/* Main navbar */}
      <nav className="bg-[#0F172A] border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-6">
          {/* Brand */}
          <Link href="/" className="flex items-center shrink-0" onClick={() => setActiveMenu(null)}>
            <KomorebiLogo iconSize={28} />
          </Link>

          {/* Nav items */}
          <div className="hidden lg:flex items-center gap-1">
            {(Object.keys(megaMenus) as MenuKey[]).map((key) => (
              <button
                key={key}
                onMouseEnter={() => openMenu(key)}
                onMouseLeave={closeMenu}
                className={`flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeMenu === key
                    ? "text-white bg-white/10"
                    : "text-slate-300 hover:text-white hover:bg-white/5"
                }`}
              >
                {key}
                <ChevronDown
                  className={`size-3.5 transition-transform ${activeMenu === key ? "rotate-180" : ""}`}
                />
              </button>
            ))}
            <Link
              href="/#how-it-works"
              className="px-3 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            >
              How It Works
            </Link>
          </div>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-3 shrink-0">
            <ThemeToggle />
            <Link href="/sign-in" className="flex items-center gap-1.5 text-sm font-medium text-slate-300 hover:text-white transition-colors">
              <UserCircle className="size-4" />
              Sign In
            </Link>
            <Link
              href="/demo"
              className="inline-flex items-center justify-center rounded-lg px-4 h-8 text-sm font-semibold bg-orange-500 text-white hover:bg-orange-400 transition-colors"
            >
              Get a Demo →
            </Link>
          </div>
        </div>
      </nav>

      {/* Mega menu dropdown */}
      {menu && activeMenu && (
        <div
          onMouseEnter={cancelClose}
          onMouseLeave={closeMenu}
          className="absolute top-full left-0 right-0 bg-white dark:bg-[#1e293b] border-b border-border shadow-2xl"
        >
          <div className="max-w-7xl mx-auto px-6 py-8 flex gap-8">
            {/* Columns */}
            <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 gap-8">
              {menu.columns.map((col) => (
                <div key={col.heading}>
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3 pb-2 border-b border-border">
                    {col.heading}
                  </p>
                  <ul className="space-y-2">
                    {col.links.map(({ label, href }) => (
                      <li key={label}>
                        <Link
                          href={href}
                          onClick={() => setActiveMenu(null)}
                          className="text-sm text-foreground hover:text-orange-500 transition-colors"
                        >
                          {label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Featured card */}
            <div className="w-64 shrink-0">
              <div className="rounded-xl bg-gradient-to-br from-[#0F172A] to-[#1e293b] border border-white/10 p-5 h-full flex flex-col gap-3">
                <div className="w-full h-28 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                  <ShieldCheck className="size-12 text-orange-400 opacity-60" />
                </div>
                <p className="text-white font-bold text-sm">{menu.featured.title}</p>
                <p className="text-slate-400 text-xs leading-relaxed flex-1">
                  {menu.featured.description}
                </p>
                <Link
                  href={menu.featured.href}
                  onClick={() => setActiveMenu(null)}
                  className="flex items-center gap-1 text-orange-400 text-xs font-semibold hover:text-orange-300 transition-colors"
                >
                  → {menu.featured.cta}
                </Link>
              </div>
            </div>

            {/* Close button */}
            <button
              onClick={() => setActiveMenu(null)}
              className="absolute top-4 right-6 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Close menu"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
