"use client"

import { useState } from "react"
import { ArrowRight } from "lucide-react"

const employeeRanges = [
  "1–10",
  "11–50",
  "51–200",
  "201–500",
  "501–1,000",
  "1,001–5,000",
  "5,001–10,000",
  "10,000+",
]

const countries = [
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "Germany",
  "France",
  "Netherlands",
  "Singapore",
  "United Arab Emirates",
  "Saudi Arabia",
  "Ethiopia",
  "Kenya",
  "Nigeria",
  "South Africa",
  "Other",
]

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    company: "",
    phone: "",
    employees: "",
    country: "",
    message: "",
  })

  const set = (field: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    // Simulate submission
    setTimeout(() => {
      setLoading(false)
      setSubmitted(true)
    }, 1200)
  }

  const inputClass =
    "w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-colors"

  if (submitted) {
    return (
      <div className="text-center py-12 space-y-4">
        <div className="w-16 h-16 rounded-full bg-orange-500/10 flex items-center justify-center mx-auto">
          <ArrowRight className="size-8 text-orange-500" />
        </div>
        <h3 className="text-xl font-bold text-foreground">Thank you!</h3>
        <p className="text-muted-foreground">
          Our sales team will be in touch within one business day.
        </p>
        <a
          href="/sign-up"
          className="inline-flex items-center justify-center rounded-lg px-6 h-10 text-sm font-semibold bg-orange-500 text-white hover:bg-orange-400 transition-colors mt-2"
        >
          Get Started Now →
        </a>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Name row */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            First Name <span className="text-destructive">*</span>
          </label>
          <input
            type="text"
            required
            value={form.firstName}
            onChange={set("firstName")}
            className={inputClass}
            placeholder="Jane"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Last Name <span className="text-destructive">*</span>
          </label>
          <input
            type="text"
            required
            value={form.lastName}
            onChange={set("lastName")}
            className={inputClass}
            placeholder="Smith"
          />
        </div>
      </div>

      {/* Email + Company */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Business Email <span className="text-destructive">*</span>
          </label>
          <input
            type="email"
            required
            value={form.email}
            onChange={set("email")}
            className={inputClass}
            placeholder="jane@company.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Company Name <span className="text-destructive">*</span>
          </label>
          <input
            type="text"
            required
            value={form.company}
            onChange={set("company")}
            className={inputClass}
            placeholder="Acme Corp"
          />
        </div>
      </div>

      {/* Phone + Employees */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Phone <span className="text-destructive">*</span>
          </label>
          <input
            type="tel"
            required
            value={form.phone}
            onChange={set("phone")}
            className={inputClass}
            placeholder="+1 555 000 0000"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Number of Employees <span className="text-destructive">*</span>
          </label>
          <select
            required
            value={form.employees}
            onChange={set("employees")}
            className={inputClass}
          >
            <option value="">— Please Select —</option>
            {employeeRanges.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Country */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">
          Company Country <span className="text-destructive">*</span>
        </label>
        <select
          required
          value={form.country}
          onChange={set("country")}
          className={inputClass}
        >
          <option value="">— Please Select —</option>
          {countries.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Message */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">
          How can we help? <span className="text-muted-foreground text-xs">(optional)</span>
        </label>
        <textarea
          value={form.message}
          onChange={set("message")}
          rows={3}
          className={inputClass}
          placeholder="Tell us about your security awareness training needs..."
        />
      </div>

      {/* Privacy note */}
      <p className="text-xs text-muted-foreground">
        By submitting this form I confirm that I have read and agree to the{" "}
        <a href="#" className="text-orange-500 hover:underline">privacy statement</a>.
      </p>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full inline-flex items-center justify-center gap-2 rounded-lg h-12 text-base font-semibold bg-orange-500 text-white hover:bg-orange-400 disabled:opacity-60 disabled:cursor-not-allowed transition-colors shadow-lg shadow-orange-500/20"
      >
        {loading ? "Submitting…" : (
          <>
            I&apos;m Interested!
            <ArrowRight className="size-4" />
          </>
        )}
      </button>
    </form>
  )
}
