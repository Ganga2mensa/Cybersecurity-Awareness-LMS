import { Navbar } from "@/components/landing/Navbar"
import { Footer } from "@/components/landing/Footer"
import { ContactForm } from "@/components/landing/ContactForm"
import { ShieldCheck, Phone, Mail, MessageCircle } from "lucide-react"

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pt-16">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

            {/* Left — Contact info */}
            <div className="space-y-8">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <ShieldCheck className="size-6 text-orange-500" />
                  <span className="text-orange-500 text-sm font-semibold uppercase tracking-widest">
                    Get in Touch
                  </span>
                </div>
                <h1 className="text-4xl sm:text-5xl font-extrabold text-foreground leading-tight">
                  Contact Sales
                </h1>
                <p className="mt-4 text-muted-foreground text-lg leading-relaxed">
                  Please use the contact form and our sales staff will be happy to help you find the right security awareness training solution for your organization.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 rounded-xl border border-border bg-card">
                  <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center shrink-0">
                    <Phone className="size-5 text-orange-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Call Us</p>
                    <p className="text-muted-foreground text-sm mt-0.5">
                      Speak directly with our sales team
                    </p>
                    <p className="text-orange-500 font-medium text-sm mt-1">
                      +1 (855) 726-3483
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-xl border border-border bg-card">
                  <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center shrink-0">
                    <Mail className="size-5 text-orange-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Email Us</p>
                    <p className="text-muted-foreground text-sm mt-0.5">
                      We respond within one business day
                    </p>
                    <p className="text-orange-500 font-medium text-sm mt-1">
                      sales@securalearn.com
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-xl border border-border bg-card">
                  <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center shrink-0">
                    <MessageCircle className="size-5 text-orange-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Need Technical Support?</p>
                    <p className="text-muted-foreground text-sm mt-0.5">
                      For support-related questions, please visit our{" "}
                      <a href="/sign-in" className="text-orange-500 hover:underline">
                        support portal
                      </a>
                      .
                    </p>
                  </div>
                </div>
              </div>

              {/* Trust badges */}
              <div className="pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground mb-3 uppercase tracking-widest font-semibold">
                  Trusted by organizations worldwide
                </p>
                <div className="flex flex-wrap gap-3">
                  {["ISO 27001 Aligned", "GDPR Ready", "NIST Framework", "Gartner Recognized"].map((badge) => (
                    <span
                      key={badge}
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-orange-600 dark:text-orange-400 bg-orange-500/10 border border-orange-500/20 rounded-full px-3 py-1"
                    >
                      <ShieldCheck className="size-3" />
                      {badge}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Right — Form */}
            <div className="rounded-2xl border border-border bg-card shadow-sm p-8">
              <h2 className="text-xl font-bold text-foreground mb-6">
                Tell us about your organization
              </h2>
              <ContactForm />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
