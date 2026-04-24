import { Navbar } from "@/components/landing/Navbar"
import { Footer } from "@/components/landing/Footer"
import { DemoForm } from "@/components/landing/DemoForm"
import { Zap, Clock, Fish, LayoutDashboard, Star } from "lucide-react"

const features = [
  {
    icon: Zap,
    title: "Autopilot in Action",
    description:
      "Watch campaigns schedule themselves, reminders go out automatically, and reports generate without anyone touching a button.",
  },
  {
    icon: Clock,
    title: "Your Time Back",
    description:
      "See exactly how hours of weekly admin work disappears. Real numbers from real organizations.",
  },
  {
    icon: Fish,
    title: "Live Phishing Demo",
    description:
      "Watch a simulated phishing test go out, see what happens when someone clicks, and how training fires automatically.",
  },
  {
    icon: LayoutDashboard,
    title: "Multi-Tenant Dashboard",
    description:
      "Manage multiple departments or organizations from one place. Deploy globally, customize locally.",
  },
]

const testimonial = {
  quote:
    "The analytics reports are exactly what I need to show leadership how informed our team is on security awareness. Great features, great support.",
  author: "Sarah M., IT Director",
  rating: 5,
}

export default function DemoPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#0F172A] pt-16">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

            {/* Left — What you'll see */}
            <div className="space-y-10">
              <div>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
                  What You&apos;ll See
                </h1>
                <p className="mt-3 text-slate-400">
                  A quick look into SecuraLearn — see the platform in action before you commit.
                </p>
              </div>

              <div className="space-y-6">
                {features.map(({ icon: Icon, title, description }) => (
                  <div key={title} className="flex gap-4">
                    <div className="shrink-0 w-10 h-10 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                      <Icon className="size-5 text-orange-400" />
                    </div>
                    <div>
                      <p className="text-white font-semibold">{title}</p>
                      <p className="text-slate-400 text-sm mt-1 leading-relaxed">{description}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Testimonial */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4">
                <div className="flex items-center gap-1">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="size-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-slate-300 text-sm leading-relaxed italic">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
                <p className="text-slate-500 text-xs font-medium">— {testimonial.author}</p>
              </div>
            </div>

            {/* Right — Booking form */}
            <div className="rounded-2xl border border-white/10 bg-[#1e293b] p-8 shadow-2xl">
              <h2 className="text-2xl font-bold text-white mb-2">
                Book a 30-Minute Demo
              </h2>
              <p className="text-slate-400 text-sm mb-8">
                Take a quick look into our program, pricing, and learn why hundreds of organizations choose SecuraLearn.
              </p>
              <DemoForm />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
