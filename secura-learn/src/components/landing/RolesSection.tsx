"use client"

import { useState } from "react"

const roles = [
  {
    label: "IT Teams",
    points: [
      "Block phishing attempts with simulated attack campaigns before real ones hit.",
      "Detect risky user behaviors and get alerted before they become incidents.",
      "Empower users with real-time security coaching to reduce helpdesk tickets.",
      "Automate training assignments and track completion without manual effort.",
    ],
  },
  {
    label: "Security Teams",
    points: [
      "Accurately assess and report on your organization's human risk score.",
      "Protect against advanced social engineering and spear-phishing threats.",
      "Reduce administrative burden with automated campaign management.",
      "Integrate with your existing security stack via API and webhooks.",
    ],
  },
  {
    label: "Compliance & Privacy",
    points: [
      "Automate policy acknowledgment, reporting, and audit-readiness workflows.",
      "Stay current with evolving regulations using continuously updated content.",
      "Reduce risk of fines and reputational damage from non-compliance.",
      "Generate compliance reports for GDPR, ISO 27001, NIST, and more.",
    ],
  },
  {
    label: "HR & People Teams",
    points: [
      "Combine compliance and security training in one seamless platform.",
      "Reduce administrative burden with automated campaigns and reporting.",
      "Support a positive security culture without adding friction for employees.",
      "Track employee training progress and completion across the organization.",
    ],
  },
]

export function RolesSection() {
  const [active, setActive] = useState(0)

  return (
    <section className="bg-[#0F172A] border-t border-white/10 py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <span className="inline-block text-orange-400 text-sm font-semibold uppercase tracking-widest mb-3">
            Built for Every Team
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            Leading security teams prefer SecuraLearn
          </h2>
        </div>

        {/* Tab buttons */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {roles.map(({ label }, i) => (
            <button
              key={label}
              onClick={() => setActive(i)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors ${
                active === i
                  ? "bg-orange-500 text-white"
                  : "bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white border border-white/10"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
          <ul className="space-y-4">
            {roles[active].points.map((point) => (
              <li key={point} className="flex items-start gap-3">
                <span className="mt-1 shrink-0 w-5 h-5 rounded-full bg-orange-500/20 flex items-center justify-center">
                  <span className="w-2 h-2 rounded-full bg-orange-400" />
                </span>
                <span className="text-slate-300 text-sm leading-relaxed">{point}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
