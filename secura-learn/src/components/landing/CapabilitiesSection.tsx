import {
  BookOpen,
  Fish,
  BarChart3,
  Users,
  ShieldCheck,
  Bell,
  Award,
  Lock,
  Zap,
} from "lucide-react"

const capabilities = [
  {
    icon: BookOpen,
    title: "Interactive Course Library",
    description:
      "Engaging video, text, and quiz-based lessons covering phishing, password security, social engineering, and more.",
  },
  {
    icon: Fish,
    title: "Realistic Phishing Simulations",
    description:
      "Send simulated phishing emails to test employee vigilance. Track who clicked, opened, or reported the simulation.",
  },
  {
    icon: BarChart3,
    title: "Advanced Analytics",
    description:
      "Real-time dashboards showing completion rates, risk scores, and campaign performance across your organization.",
  },
  {
    icon: Users,
    title: "Multi-Tenant Management",
    description:
      "Manage multiple departments or organizations from a single platform with complete data isolation.",
  },
  {
    icon: ShieldCheck,
    title: "Role-Based Access Control",
    description:
      "Assign Admin, Manager, or Learner roles to control who can create content, run campaigns, or view reports.",
  },
  {
    icon: Bell,
    title: "Automated Notifications",
    description:
      "Automatically notify learners of new course assignments and remind them of incomplete training.",
  },
  {
    icon: Award,
    title: "Badges & Certificates",
    description:
      "Reward learners with badges upon course completion to motivate engagement and recognize achievement.",
  },
  {
    icon: Lock,
    title: "Enterprise-Grade Security",
    description:
      "Built on Supabase PostgreSQL with row-level security, Clerk authentication, and encrypted data at rest.",
  },
  {
    icon: Zap,
    title: "SCORM Support",
    description:
      "Import and serve existing SCORM 1.2 packages alongside native content for seamless content migration.",
  },
]

export function CapabilitiesSection() {
  return (
    <section className="bg-background py-24 px-6 border-t border-border">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <span className="inline-block text-orange-500 text-sm font-semibold uppercase tracking-widest mb-3">
            Features & Capabilities
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
            Everything your security program needs
          </h2>
          <p className="mt-4 text-muted-foreground text-lg max-w-2xl mx-auto">
            A complete security awareness training platform — from content creation to campaign management.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {capabilities.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="rounded-xl border border-border bg-card p-6 hover:border-orange-500/40 hover:shadow-sm transition-all"
            >
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-orange-500/10 mb-4">
                <Icon className="size-5 text-orange-500" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
