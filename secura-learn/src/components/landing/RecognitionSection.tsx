import { ShieldCheck, Award, Star, TrendingUp } from "lucide-react"

const recognitions = [
  {
    icon: ShieldCheck,
    title: "NIST Aligned",
    description: "Training content aligned with NIST Cybersecurity Framework guidelines.",
  },
  {
    icon: Award,
    title: "ISO 27001 Compatible",
    description: "Supports ISO 27001 security awareness and training requirements.",
  },
  {
    icon: Star,
    title: "GDPR Ready",
    description: "Data handling practices designed to support GDPR compliance requirements.",
  },
  {
    icon: TrendingUp,
    title: "Gartner Recognized",
    description: "Security awareness training recognized as a key control by Gartner analysts.",
  },
]

const testimonials = [
  {
    quote:
      "SecuraLearn transformed how we approach security training. Our phishing click rate dropped by 65% in just three months.",
    name: "Sarah M.",
    role: "CISO, Financial Services",
  },
  {
    quote:
      "The platform is intuitive and our employees actually enjoy the training. Completion rates went from 40% to 94%.",
    name: "James K.",
    role: "IT Security Manager, Healthcare",
  },
  {
    quote:
      "We needed a solution that could scale across 500+ employees. SecuraLearn delivered from day one.",
    name: "Priya L.",
    role: "Head of Security, Technology",
  },
]

export function RecognitionSection() {
  return (
    <>
      {/* Industry Recognition */}
      <section className="bg-background py-20 px-6 border-t border-border">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span className="inline-block text-orange-500 text-sm font-semibold uppercase tracking-widest mb-3">
              Industry Recognition
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
              SecuraLearn Industry Recognition
            </h2>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
              Built to meet the standards that matter most to security professionals.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recognitions.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="rounded-xl border border-border bg-card p-6 text-center hover:border-orange-500/40 transition-colors"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-orange-500/10 mb-4">
                  <Icon className="size-6 text-orange-500" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-[#0F172A] border-t border-white/10 py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span className="inline-block text-orange-400 text-sm font-semibold uppercase tracking-widest mb-3">
              Testimonials
            </span>
            <h2 className="text-3xl font-bold text-white">
              Trusted by security teams worldwide
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map(({ quote, name, role }) => (
              <div
                key={name}
                className="rounded-xl border border-white/10 bg-white/5 p-6 flex flex-col gap-4"
              >
                <p className="text-slate-300 text-sm leading-relaxed italic">
                  &ldquo;{quote}&rdquo;
                </p>
                <div className="mt-auto">
                  <p className="text-white font-semibold text-sm">{name}</p>
                  <p className="text-slate-500 text-xs">{role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-gradient-to-br from-orange-500 to-orange-600 py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to protect your organization?
          </h2>
          <p className="text-orange-100 text-lg mb-8 max-w-xl mx-auto">
            Join thousands of organizations using SecuraLearn to build a security-aware culture.
            Start your free trial today — no credit card required.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="/sign-up"
              className="inline-flex items-center justify-center rounded-lg px-8 h-12 text-base font-semibold bg-white text-orange-600 hover:bg-orange-50 transition-colors w-full sm:w-auto shadow-lg"
            >
              Start Free Trial
            </a>
            <a
              href="/get-started"
              className="inline-flex items-center justify-center rounded-lg px-8 h-12 text-base font-medium border-2 border-white/40 text-white hover:bg-white/10 transition-colors w-full sm:w-auto"
            >
              Learn More
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
