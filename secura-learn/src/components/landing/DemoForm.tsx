"use client"

import { useState } from "react"
import { ArrowRight } from "lucide-react"

const employeeRanges = ["1–50", "51–200", "201–500", "501–1,000", "1,001–5,000", "5,000+"]

export function DemoForm() {
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [reseller, setReseller] = useState(false)

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    employees: "",
  })

  const set = (field: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setSubmitted(true)
    }, 1200)
  }

  const inputClass =
    "w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-colors"

  if (submitted) {
    return (
      <div className="text-center py-10 space-y-4">
        <div className="w-16 h-16 rounded-full bg-orange-500/10 flex items-center justify-center mx-auto">
          <ArrowRight className="size-8 text-orange-400" />
        </div>
        <h3 className="text-xl font-bold text-white">You&apos;re booked!</h3>
        <p className="text-slate-400 text-sm">
          Our team will reach out within one business day to confirm your demo time.
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
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">
          First name <span className="text-orange-400">*</span>
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
        <label className="block text-sm font-medium text-slate-300 mb-1.5">
          Last name <span className="text-orange-400">*</span>
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

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">
          Email <span className="text-orange-400">*</span>
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
        <label className="block text-sm font-medium text-slate-300 mb-1.5">
          Number of Employees <span className="text-orange-400">*</span>
        </label>
        <select
          required
          value={form.employees}
          onChange={set("employees")}
          className={`${inputClass} appearance-none`}
        >
          <option value="" className="bg-[#1e293b]">— Select —</option>
          {employeeRanges.map((r) => (
            <option key={r} value={r} className="bg-[#1e293b]">{r}</option>
          ))}
        </select>
      </div>

      {/* Reseller checkbox */}
      <label className="flex items-center gap-3 cursor-pointer group">
        <input
          type="checkbox"
          checked={reseller}
          onChange={(e) => setReseller(e.target.checked)}
          className="w-4 h-4 rounded border-white/20 bg-white/5 accent-orange-500"
        />
        <span className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors">
          Are you interested in becoming a reseller/partner?
        </span>
      </label>

      <button
        type="submit"
        disabled={loading}
        className="w-full inline-flex items-center justify-center gap-2 rounded-lg h-12 text-base font-semibold bg-orange-500 text-white hover:bg-orange-400 disabled:opacity-60 disabled:cursor-not-allowed transition-colors shadow-lg shadow-orange-500/20 mt-2"
      >
        {loading ? "Booking…" : "Get a Demo"}
        {!loading && <ArrowRight className="size-4" />}
      </button>

      <p className="text-xs text-slate-500 text-center">
        By submitting this form, you agree to our{" "}
        <a href="#" className="text-orange-400 hover:underline">Privacy Policy</a>.
      </p>
    </form>
  )
}
