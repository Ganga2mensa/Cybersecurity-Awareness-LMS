import Link from "next/link"
import { Fish, BookOpen, BarChart3 } from "lucide-react"

const tools = [
  {
    icon: Fish,
    title: "Free Phishing Simulation",
    description:
      "Test your employees with a simulated phishing campaign. Find your organization's phish-prone percentage and see how you compare.",
    cta: "Start Phishing Test",
    href: "/sign-up",
  },
  {
    icon: BookOpen,
    title: "Security Awareness Program",
    description:
      "Get started with a structured security awareness training program. Assign courses, track progress, and measure improvement.",
    cta: "Build Your Program",
    href: "/sign-up",
  },
  {
    icon: BarChart3,
    title: "Training Content Preview",
    description:
      "Browse our library of security awareness courses covering phishing, passwords, social engineering, and more.",
    cta: "Explore Courses",
    href: "/sign-up",
  },
]

export function FreeToolsSection() {
  return (
    <section className="bg-background py-24 px-6 border-t border-border">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <span className="inline-block text-orange-500 text-sm font-semibold uppercase tracking-widest mb-3">
            Free Tools
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
            Your Free Cybersecurity Toolkit
          </h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
            Get started immediately with these free tools — no credit card required.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tools.map(({ icon: Icon, title, description, cta, href }) => (
            <div
              key={title}
              className="rounded-2xl border border-border bg-card p-6 flex flex-col gap-4 hover:border-orange-500/40 hover:shadow-sm transition-all"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-orange-500/10">
                <Icon className="size-6 text-orange-500" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-foreground mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
              </div>
              <Link
                href={href}
                className="inline-flex items-center justify-center rounded-lg px-4 h-9 text-sm font-semibold bg-orange-500 text-white hover:bg-orange-400 transition-colors"
              >
                {cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
