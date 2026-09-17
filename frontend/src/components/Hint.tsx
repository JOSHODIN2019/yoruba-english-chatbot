import { HelpCircle } from 'lucide-react'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'

interface HintProps {
  label: string
  children: string
}

type VerticalPlacement = 'below' | 'above'
type HorizontalPlacement = 'center' | 'left' | 'right'

const EDGE_PADDING = 8

/** A click-to-reveal explanation icon. Shows `children` in a small popover
 * next to the icon when clicked; closes on outside click, Escape, or a
 * second click. `label` is used for the accessible name, e.g.
 * "What does Solver mean?".
 *
 * Position is computed dynamically against the actual viewport (not just
 * assumed to fit below/centered) - confirmed necessary by real mobile
 * screenshot testing: the naive always-below, always-centered version cut
 * off at the bottom of the screen for hints near the bottom of a page, and
 * could equally overflow left/right for icons near the screen edges. */
export function Hint({ label, children }: HintProps) {
  const [open, setOpen] = useState(false)
  const [vertical, setVertical] = useState<VerticalPlacement>('below')
  const [horizontal, setHorizontal] = useState<HorizontalPlacement>('center')
  const containerRef = useRef<HTMLSpanElement>(null)
  const tooltipRef = useRef<HTMLSpanElement>(null)

  useLayoutEffect(() => {
    if (!open || !containerRef.current || !tooltipRef.current) return

    const anchor = containerRef.current.getBoundingClientRect()
    const tooltip = tooltipRef.current.getBoundingClientRect()

    const fitsBelow = anchor.bottom + tooltip.height + EDGE_PADDING <= window.innerHeight
    setVertical(fitsBelow ? 'below' : 'above')

    const centerLeft = anchor.left + anchor.width / 2 - tooltip.width / 2
    const centerRight = centerLeft + tooltip.width
    if (centerLeft < EDGE_PADDING) {
      setHorizontal('left')
    } else if (centerRight > window.innerWidth - EDGE_PADDING) {
      setHorizontal('right')
    } else {
      setHorizontal('center')
    }
  }, [open])

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

  const verticalClass = vertical === 'below' ? 'top-full mt-1.5' : 'bottom-full mb-1.5'
  const horizontalClass =
    horizontal === 'center'
      ? 'left-1/2 -translate-x-1/2'
      : horizontal === 'left'
        ? 'left-0'
        : 'right-0'

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
          ref={tooltipRef}
          role="tooltip"
          className={`absolute z-10 w-56 rounded-lg border border-border bg-surface
            p-2.5 text-xs font-normal normal-case leading-relaxed text-secondary
            shadow-lg ${verticalClass} ${horizontalClass}`}
        >
          {children}
        </span>
      )}
    </span>
  )
}
