import Link from "next/link"
import { ShieldCheck } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-[#0F172A] border-t border-white/10 py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck className="size-5 text-orange-500" />
              <span className="text-white font-bold text-lg">
                Secura<span className="text-orange-500">Learn</span>
              </span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              Security awareness training that actually works. Protect your organization from human-element threats.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Product</h4>
            <ul className="space-y-2">
              {[
                { label: "Security Training", href: "/#features" },
                { label: "Phishing Simulations", href: "/#features" },
                { label: "Analytics", href: "/#features" },
                { label: "SCORM Support", href: "/#capabilities" },
                { label: "For Organizations", href: "/get-started" },
              ].map(({ label, href }) => (
                <li key={label}>
                  <Link href={href} className="text-slate-400 hover:text-orange-400 text-sm transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Company</h4>
            <ul className="space-y-2">
              {[
                { label: "How It Works", href: "/#how-it-works" },
                { label: "Industry Recognition", href: "/#recognition" },
                { label: "Security", href: "#" },
                { label: "Privacy Policy", href: "#" },
                { label: "Terms of Service", href: "#" },
              ].map(({ label, href }) => (
                <li key={label}>
                  <Link href={href} className="text-slate-400 hover:text-orange-400 text-sm transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Get Started */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Get Started</h4>
            <ul className="space-y-2">
              {[
                { label: "Sign Up Free", href: "/sign-up" },
                { label: "Sign In", href: "/sign-in" },
                { label: "For Organizations", href: "/get-started" },
              ].map(({ label, href }) => (
                <li key={label}>
                  <Link href={href} className="text-slate-400 hover:text-orange-400 text-sm transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-6">
              <Link
                href="/sign-up"
                className="inline-flex items-center justify-center rounded-lg px-4 h-9 text-sm font-semibold bg-orange-500 text-white hover:bg-orange-400 transition-colors"
              >
                Start Free Trial
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-slate-500 text-sm">
            &copy; {new Date().getFullYear()} SecuraLearn. All rights reserved.
          </p>
          <p className="text-slate-600 text-xs">
            Built for security-conscious organizations worldwide.
          </p>
        </div>
      </div>
    </footer>
  )
}
