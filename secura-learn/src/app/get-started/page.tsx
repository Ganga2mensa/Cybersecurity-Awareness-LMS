import Link from "next/link"
import { Navbar } from "@/components/landing/Navbar"
import { Footer } from "@/components/landing/Footer"
import { CheckCircle, Users, Zap } from "lucide-react"

const valueProps = [
  {
    icon: Zap,
    title: "Set up your organization in minutes",
    description:
      "Create your account, configure your organization, and start assigning courses right away — no lengthy onboarding required.",
  },
  {
    icon: Users,
    title: "Invite your team",
    description:
      "Send email invitations to your colleagues. They join your organization instantly and get access to the courses you assign.",
  },
  {
    icon: CheckCircle,
    title: "Start training immediately",
    description:
      "Choose from a library of security awareness courses and launch your first training campaign on day one.",
  },
]

export default function GetStartedPage() {
  return (
    <>
      <Navbar />

      {/* Hero */}
      <section className="min-h-screen bg-[#0F172A] flex items-center justify-center px-6 pt-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-orange-500/10 border border-orange-500/20 px-4 py-1.5 mb-6">
            <span className="text-orange-400 text-sm font-medium">
              For Organizations
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight">
            Security Training Built{" "}
            <span className="text-orange-400">for Your Business</span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            SecuraLearn gives your organization a complete security awareness
            platform — interactive courses, phishing simulations, and real-time
            analytics — all in one place.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/sign-up"
              className="inline-flex items-center justify-center rounded-lg px-8 h-11 text-base font-semibold bg-orange-500 text-white hover:bg-orange-400 transition-colors w-full sm:w-auto shadow-lg shadow-orange-500/25"
            >
              Start Free Trial
            </Link>
            <Link
              href="/sign-in"
              className="inline-flex items-center justify-center rounded-lg px-8 h-11 text-base font-medium border border-slate-600 text-slate-300 hover:text-white hover:border-orange-500 hover:bg-orange-500/10 transition-colors w-full sm:w-auto"
            >
              Sign In
            </Link>
          </div>

          <p className="mt-4 text-slate-500 text-sm">
            No credit card required · Free 14-day trial
          </p>
        </div>
      </section>

      {/* Value propositions */}
      <section className="bg-[#0F172A] border-t border-white/10 py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-12">
            Everything you need to protect your team
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {valueProps.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="rounded-xl border border-white/10 bg-white/5 p-6 flex flex-col gap-4"
              >
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-orange-500/10 border border-orange-500/20">
                  <Icon className="w-5 h-5 text-orange-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">{title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  {description}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/sign-up"
              className="inline-flex items-center justify-center rounded-lg px-8 h-11 text-base font-semibold bg-orange-500 text-white hover:bg-orange-400 transition-colors shadow-lg shadow-orange-500/25"
            >
              Create Your Organization →
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  )
}
