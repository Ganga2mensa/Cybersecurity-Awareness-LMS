export function Footer() {
  return (
    <footer className="bg-background border-t border-border py-8 px-6">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <span className="text-foreground font-semibold text-lg">
          Secura<span className="text-orange-500">Learn</span>
        </span>
        <p className="text-muted-foreground text-sm">
          &copy; {new Date().getFullYear()} SecuraLearn. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
