import { ShieldCheck, Fish, BarChart3 } from "lucide-react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"

interface Feature {
  icon: React.ReactNode
  title: string
  description: string
}

const features: Feature[] = [
  {
    icon: <ShieldCheck className="size-8 text-orange-400" />,
    title: "Security Training",
    description:
      "Deliver engaging, role-based security awareness courses that keep your team up to date on the latest threats and best practices.",
  },
  {
    icon: <Fish className="size-8 text-orange-400" />,
    title: "Phishing Simulations",
    description:
      "Run realistic phishing campaigns to test employee vigilance, identify at-risk users, and reinforce safe email habits through immediate feedback.",
  },
  {
    icon: <BarChart3 className="size-8 text-orange-400" />,
    title: "Analytics & Reporting",
    description:
      "Track completion rates, simulation results, and risk scores across your organization with clear dashboards and exportable reports.",
  },
]

export function FeaturesSection() {
  return (
    <section className="bg-background py-24 px-6 border-t border-border">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
            Everything you need to build a security-aware culture
          </h2>
          <p className="mt-4 text-muted-foreground text-lg max-w-2xl mx-auto">
            One platform to train, test, and track your entire organization.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature) => (
            <Card
              key={feature.title}
              className="bg-card border-border hover:border-orange-500/50 transition-colors"
            >
              <CardHeader>
                <div className="mb-2">{feature.icon}</div>
                <CardTitle className="text-foreground">{feature.title}</CardTitle>
                <CardDescription className="text-muted-foreground">
                  {feature.description}
                </CardDescription>
              </CardHeader>
              <CardContent />
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
