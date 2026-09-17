import { HelpCircle } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

interface HintProps {
  label: string
  children: string
}

/** A click-to-reveal explanation icon. Shows `children` in a small popover
 * next to the icon when clicked; closes on outside click, Escape, or a
 * second click. `label` is used for the accessible name, e.g.
 * "What does Solver mean?". */
export function Hint({ label, children }: HintProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!open) return

    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  return (
    <span ref={containerRef} className="relative inline-flex">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-label={`What does ${label} mean?`}
        className="inline-flex items-center justify-center rounded-full p-0.5
          text-muted transition-colors hover:bg-surface-hover hover:text-accent"
      >
        <HelpCircle size={13} aria-hidden="true" />
      </button>

      {open && (
        <span
          role="tooltip"
          className="absolute left-1/2 top-full z-10 mt-1.5 w-56 -translate-x-1/2
            rounded-lg border border-border bg-surface p-2.5 text-xs font-normal
            normal-case leading-relaxed text-secondary shadow-lg"
        >
          {children}
        </span>
      )}
    </span>
  )
}
