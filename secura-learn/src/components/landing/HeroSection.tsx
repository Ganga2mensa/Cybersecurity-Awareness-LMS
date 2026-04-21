import Link from "next/link"

export function HeroSection() {
  return (
    <section className="min-h-screen bg-[#0F172A] flex items-center justify-center px-6 pt-20">
      <div className="max-w-3xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-orange-500/10 border border-orange-500/20 px-4 py-1.5 mb-6">
          <span className="text-orange-400 text-sm font-medium">Security Awareness Platform</span>
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight">
          Protect Your Organization with{" "}
          <span className="text-orange-400">Security Awareness</span> Training
        </h1>
        <p className="mt-6 text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
          SecuraLearn empowers your team with interactive security courses,
          realistic phishing simulations, and actionable analytics — so every
          employee becomes your strongest line of defense.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/sign-up"
            className="inline-flex items-center justify-center rounded-lg px-8 h-11 text-base font-semibold bg-orange-500 text-white hover:bg-orange-400 transition-colors w-full sm:w-auto shadow-lg shadow-orange-500/25"
          >
            Get Started Free
          </Link>
          <Link
            href="/sign-in"
            className="inline-flex items-center justify-center rounded-lg px-8 h-11 text-base font-medium border border-slate-600 text-slate-300 hover:text-white hover:border-orange-500 hover:bg-orange-500/10 transition-colors w-full sm:w-auto"
          >
            Sign In
          </Link>
        </div>
        <p className="mt-4 text-slate-500 text-sm">No credit card required</p>
      </div>
    </section>
  )
}
