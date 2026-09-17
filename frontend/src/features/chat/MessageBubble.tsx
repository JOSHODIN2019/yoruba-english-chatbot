import { ChevronDown, Sparkles } from 'lucide-react'
import { useState } from 'react'
import type { ChatMessage } from '../../types/chat'

export function MessageBubble({ message }: { message: ChatMessage }) {
  const [detailsOpen, setDetailsOpen] = useState(false)
  const isUser = message.role === 'user'

  if (isUser) {
    return (
      <div className="flex justify-end">
        <p className="max-w-[75%] whitespace-pre-wrap break-words rounded-lg
          rounded-tr-sm bg-accent px-4 py-2.5 text-sm text-on-accent shadow-sm">
          {message.content}
        </p>
      </div>
    )
  }

  const hasDetails = message.detected_language && message.predicted_intent

  return (
    <div className="flex items-start gap-2.5">
      <div
        className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full
          bg-accent-soft"
        aria-hidden="true"
      >
        <Sparkles size={14} className="text-accent" />
      </div>
      <div className="flex max-w-[75%] flex-col gap-1.5">
        <p className="whitespace-pre-wrap break-words rounded-lg rounded-tl-sm
          bg-surface px-4 py-2.5 text-sm text-primary shadow-sm">
          {message.content}
        </p>

        {hasDetails && (
          <div className="text-xs">
            <button
              type="button"
              onClick={() => setDetailsOpen((open) => !open)}
              aria-expanded={detailsOpen}
              className="flex items-center gap-1 rounded-md px-1.5 py-1 text-muted
                transition-colors hover:bg-surface-hover hover:text-secondary"
            >
              <ChevronDown
                size={12}
                className={`transition-transform ${detailsOpen ? 'rotate-180' : ''}`}
                aria-hidden="true"
              />
              Processing details
            </button>

            {detailsOpen && (
              <dl className="mt-1 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 rounded-lg
                border border-border bg-surface px-3 py-2 text-secondary">
                <dt className="font-medium">Detected language</dt>
                <dd>{message.detected_language}</dd>
                <dt className="font-medium">Predicted intent</dt>
                <dd className="font-mono">{message.predicted_intent}</dd>
                {message.response_metadata?.preprocessed_text && (
                  <>
                    <dt className="font-medium">Preprocessed text</dt>
                    <dd className="font-mono">
                      {message.response_metadata.preprocessed_text || '(empty)'}
                    </dd>
                  </>
                )}
              </dl>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
