import Link from "next/link"
import { BookOpen, Fish, BarChart3, ShieldCheck } from "lucide-react"

const products = [
  {
    icon: BookOpen,
    tag: "Security Training",
    title: "Change behavior. Build resilience.",
    description:
      "Go beyond check-the-box training. Deliver timely, personalized education that helps your people recognize and resist evolving threats — from phishing to social engineering.",
    cta: "Explore Training",
    href: "/#capabilities",
    color: "text-orange-400",
    bg: "bg-orange-500/10",
    border: "border-orange-500/20",
  },
  {
    icon: Fish,
    tag: "Phishing Simulations",
    title: "Test your team before attackers do.",
    description:
      "Send realistic simulated phishing emails to identify at-risk employees. Track who clicked, opened, or reported — then automatically enroll them in targeted training.",
    cta: "Explore Simulations",
    href: "/#how-it-works",
    color: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/20",
  },
  {
    icon: BarChart3,
    tag: "Analytics & Reporting",
    title: "Measure risk. Prove ROI.",
    description:
      "Real-time dashboards show completion rates, phishing click rates, and risk scores across your organization. Export reports for compliance and executive briefings.",
    cta: "Explore Analytics",
    href: "/#capabilities",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
  },
  {
    icon: ShieldCheck,
    tag: "Compliance Plus",
    title: "Turn compliance into confidence.",
    description:
      "Streamline policy delivery, tracking, and acknowledgment. Stay audit-ready with automated workflows aligned to NIST, ISO 27001, GDPR, and more.",
    cta: "Explore Compliance",
    href: "/#capabilities",
    color: "text-green-400",
    bg: "bg-green-500/10",
    border: "border-green-500/20",
  },
]

export function FeaturesSection() {
  return (
    <section className="bg-background py-24 px-6 border-t border-border">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <span className="inline-block text-orange-500 text-sm font-semibold uppercase tracking-widest mb-3">
            The Platform
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
            Reduce risk where it starts: human decisions
          </h2>
          <p className="mt-4 text-muted-foreground text-lg max-w-2xl mx-auto">
            SecuraLearn protects your most vulnerable attack surface — your people.
            One platform to train, test, and track your entire organization.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {products.map(({ icon: Icon, tag, title, description, cta, href, color, bg, border }) => (
            <div
              key={tag}
              className={`rounded-2xl border ${border} bg-card p-8 hover:shadow-md transition-all group`}
            >
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${bg} mb-5`}>
                <Icon className={`size-6 ${color}`} />
              </div>
              <div className={`inline-block text-xs font-semibold uppercase tracking-widest ${color} mb-2`}>
                {tag}
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">{title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-6">{description}</p>
              <Link
                href={href}
                className={`inline-flex items-center text-sm font-semibold ${color} hover:underline`}
              >
                {cta} →
              </Link>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/get-started"
            className="inline-flex items-center justify-center rounded-lg px-8 h-11 text-base font-semibold bg-orange-500 text-white hover:bg-orange-400 transition-colors shadow-lg shadow-orange-500/20"
          >
            Platform Overview →
          </Link>
        </div>
      </div>
    </section>
  )
}
