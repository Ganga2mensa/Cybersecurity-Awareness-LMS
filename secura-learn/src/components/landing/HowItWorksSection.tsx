import { UserPlus, BookOpen, Fish, BarChart3 } from "lucide-react"

const steps = [
  {
    step: "01",
    icon: UserPlus,
    title: "Set Up Your Organization",
    description:
      "Create your SecuraLearn account, set up your organization, and invite your team members in minutes. No IT setup required.",
  },
  {
    step: "02",
    icon: BookOpen,
    title: "Assign Training Courses",
    description:
      "Choose from our library of security awareness courses or create your own. Assign courses to individuals, teams, or your entire organization.",
  },
  {
    step: "03",
    icon: Fish,
    title: "Launch Phishing Simulations",
    description:
      "Create realistic phishing email templates and send simulated attacks to your employees. Track who clicks, opens, or reports the simulation.",
  },
  {
    step: "04",
    icon: BarChart3,
    title: "Measure & Improve",
    description:
      "Monitor completion rates, phishing click rates, and risk scores in real time. Use insights to target at-risk employees with additional training.",
  },
]

export function HowItWorksSection() {
  return (
    <section className="bg-[#0F172A] border-t border-white/10 py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <span className="inline-block text-orange-400 text-sm font-semibold uppercase tracking-widest mb-3">
            How It Works
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            How SecuraLearn Security Awareness Training Works
          </h2>
          <p className="mt-4 text-slate-400 max-w-2xl mx-auto">
            Get your organization protected in four simple steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {steps.map(({ step, icon: Icon, title, description }) => (
            <div key={step} className="flex gap-5">
              <div className="shrink-0">
                <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                  <Icon className="size-5 text-orange-400" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-orange-500 text-xs font-bold uppercase tracking-widest">
                    Step {step}
                  </span>
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">{title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
