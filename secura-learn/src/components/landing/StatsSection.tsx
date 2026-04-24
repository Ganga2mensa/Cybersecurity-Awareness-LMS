export function StatsSection() {
  const stats = [
    {
      value: "74%",
      label: "of security breaches include the human element",
      source: "Verizon DBIR 2024",
    },
    {
      value: "36%",
      label: "of data breaches are caused by phishing activities",
      source: "Verizon DBIR 2024",
    },
    {
      value: "70%",
      label: "reduction in social engineering attacks for organizations with SAT",
      source: "Gartner Research",
    },
  ]

  return (
    <section className="bg-[#0F172A] border-t border-white/10 py-20 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <span className="inline-block text-orange-400 text-sm font-semibold uppercase tracking-widest mb-3">
            Why It Matters
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            Why Choose SecuraLearn Security Awareness Training
          </h2>
          <p className="mt-4 text-slate-400 max-w-2xl mx-auto">
            Cyber threats are evolving — and your employees are the last line of defense.
            The numbers speak for themselves.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat) => (
            <div
              key={stat.value}
              className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center hover:border-orange-500/40 transition-colors"
            >
              <p className="text-6xl font-extrabold text-orange-400 mb-4">{stat.value}</p>
              <p className="text-white font-medium leading-snug mb-3">{stat.label}</p>
              <p className="text-slate-500 text-xs">{stat.source}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
