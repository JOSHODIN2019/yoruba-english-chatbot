import { Send } from 'lucide-react'
import { useState, type FormEvent, type KeyboardEvent } from 'react'

interface ChatComposerProps {
  onSend: (message: string) => void
  disabled: boolean
}

const MAX_LENGTH = 1000

export function ChatComposer({ onSend, disabled }: ChatComposerProps) {
  const [value, setValue] = useState('')

  const trimmed = value.trim()
  const canSend = trimmed.length > 0 && trimmed.length <= MAX_LENGTH && !disabled

  const submit = () => {
    if (!canSend) return
    onSend(trimmed)
    setValue('')
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    submit()
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      submit()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="px-4 pb-4 pt-2">
      <div
        className="mx-auto flex max-w-3xl items-end gap-2 rounded-lg border
          border-border bg-surface px-3 py-2 shadow-sm focus-within:border-accent"
      >
        <label htmlFor="chat-message-input" className="sr-only">
          Message
        </label>
        <textarea
          id="chat-message-input"
          rows={1}
          value={value}
          maxLength={MAX_LENGTH}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Message in English, Yoruba, or both…"
          className="max-h-40 flex-1 resize-none bg-transparent py-1.5 text-sm
            text-primary placeholder:text-muted focus:outline-none"
        />
        <button
          type="submit"
          disabled={!canSend}
          aria-label="Send message"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full
            bg-accent text-on-accent transition-opacity
            disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Send size={16} />
        </button>
      </div>
      <p className="mx-auto mt-1.5 max-w-3xl text-center text-xs text-muted">
        {trimmed.length}/{MAX_LENGTH}
      </p>
    </form>
  )
}
