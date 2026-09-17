import { Sparkles } from 'lucide-react'

export function LoadingIndicator() {
  return (
    <div className="flex items-center gap-2.5" role="status" aria-live="polite">
      <div
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent-soft"
        aria-hidden="true"
      >
        <Sparkles size={14} className="text-accent" />
      </div>
      <div className="flex items-center gap-1 rounded-lg rounded-tl-sm bg-surface px-4 py-3 shadow-sm">
        <span className="sr-only">Thinking…</span>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted"
            style={{ animationDelay: `${i * 120}ms` }}
            aria-hidden="true"
          />
        ))}
      </div>
    </div>
  )
}
