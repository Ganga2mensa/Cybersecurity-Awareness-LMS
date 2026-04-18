import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function HeroSection() {
  return (
    <section className="min-h-screen bg-[#0F172A] flex items-center justify-center px-6 pt-20">
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight">
          Protect Your Organization with Security Awareness Training
        </h1>
        <p className="mt-6 text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
          SecuraLearn empowers your team with interactive security courses,
          realistic phishing simulations, and actionable analytics — so every
          employee becomes your strongest line of defense.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/sign-up"
            className={cn(buttonVariants({ size: "lg" }), "w-full sm:w-auto px-8")}
          >
            Get Started
          </Link>
          <Link
            href="/sign-in"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "w-full sm:w-auto px-8 border-slate-600 text-slate-300 hover:text-white hover:border-slate-400"
            )}
          >
            Sign In
          </Link>
        </div>
      </div>
    </section>
  )
}
