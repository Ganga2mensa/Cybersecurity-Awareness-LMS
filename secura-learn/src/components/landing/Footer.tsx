export function Footer() {
  return (
    <footer className="bg-[#0F172A] border-t border-white/10 py-8 px-6">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <span className="text-white font-semibold text-lg">SecuraLearn</span>
        <p className="text-slate-400 text-sm">
          &copy; {new Date().getFullYear()} SecuraLearn. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
