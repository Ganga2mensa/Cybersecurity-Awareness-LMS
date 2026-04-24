import Link from "next/link"
import { ShieldCheck, Users, Award, TrendingUp } from "lucide-react"

const trustStats = [
  { icon: Users, value: "10,000+", label: "employees trained worldwide" },
  { icon: ShieldCheck, value: "95%", label: "reduction in phishing click rates" },
  { icon: Award, value: "ISO 27001", label: "aligned training content" },
  { icon: TrendingUp, value: "Gartner", label: "recognized SAT approach" },
]

export function HeroSection() {
  return (
    <section className="bg-[#0F172A] pt-20">
      {/* Main hero */}
      <div className="max-w-6xl mx-auto px-6 py-20 flex flex-col lg:flex-row items-center gap-12">
        {/* Left — copy */}
        <div className="flex-1 space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-orange-500/10 border border-orange-500/20 px-4 py-1.5">
            <span className="text-orange-400 text-sm font-medium">
              #1 Security Awareness Training Platform
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight tracking-tight">
            Secure the Human Element of{" "}
            <span className="text-orange-400">Your Organization</span>
          </h1>

          <p className="text-lg text-slate-400 max-w-xl leading-relaxed">
            Everything you need to reduce human risk — interactive security training,
            realistic phishing simulations, and actionable analytics — all in one platform.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              href="/demo"
              className="inline-flex items-center justify-center rounded-lg px-8 h-12 text-base font-semibold bg-orange-500 text-white hover:bg-orange-400 transition-colors shadow-lg shadow-orange-500/25"
            >
              Get a Demo
            </Link>
            <Link
              href="/sign-up"
              className="inline-flex items-center justify-center rounded-lg px-8 h-12 text-base font-medium border border-slate-600 text-slate-300 hover:text-white hover:border-orange-500 hover:bg-orange-500/10 transition-colors"
            >
              Start Free Trial
            </Link>
          </div>

          <p className="text-slate-500 text-sm">
            No credit card required · Free 14-day trial · Cancel anytime
          </p>
        </div>

        {/* Right — visual card */}
        <div className="flex-1 w-full max-w-md">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-white font-semibold">Security Risk Dashboard</span>
              <span className="text-xs text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-full">Live</span>
            </div>

            {/* Mock risk meter */}
            <div className="space-y-3">
              {[
                { label: "Phishing Susceptibility", value: 72, color: "bg-red-500" },
                { label: "Password Hygiene", value: 45, color: "bg-yellow-500" },
                { label: "Security Awareness Score", value: 28, color: "bg-orange-500" },
              ].map(({ label, value, color }) => (
                <div key={label}>
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>{label}</span>
                    <span className="text-white font-medium">{value}% at risk</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/10">
                    <div
                      className={`h-2 rounded-full ${color}`}
                      style={{ width: `${value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-lg bg-orange-500/10 border border-orange-500/20 p-3 text-sm text-orange-300">
              🚨 <strong>72% of your users</strong> are susceptible to phishing.
              Start training today to reduce your risk.
            </div>

            <Link
              href="/sign-up"
              className="block text-center rounded-lg px-4 h-9 text-sm font-semibold bg-orange-500 text-white hover:bg-orange-400 transition-colors leading-9"
            >
              Start Free Phishing Test →
            </Link>
          </div>
        </div>
      </div>

      {/* Trust stats bar */}
      <div className="border-t border-white/10 bg-white/5">
        <div className="max-w-6xl mx-auto px-6 py-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          {trustStats.map(({ icon: Icon, value, label }) => (
            <div key={value} className="flex items-center gap-3">
              <Icon className="size-5 text-orange-400 shrink-0" />
              <div>
                <p className="text-white font-bold text-sm">{value}</p>
                <p className="text-slate-400 text-xs">{label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
