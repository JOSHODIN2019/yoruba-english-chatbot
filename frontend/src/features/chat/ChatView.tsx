import { AlertCircle, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { ApiError, predictChat } from '../../services/api'
import type { ChatMessage, Conversation } from '../../types/chat'
import { ChatComposer } from './ChatComposer'
import { EmptyState } from './EmptyState'
import { LoadingIndicator } from './LoadingIndicator'
import { MessageBubble } from './MessageBubble'

interface ChatViewProps {
  activeConversation: Conversation | null
  onAppendMessage: (message: ChatMessage) => void
}

const MIN_THINKING_MS = 2000
const MAX_THINKING_MS = 3000

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function ChatView({ activeConversation, onAppendMessage }: ChatViewProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  const messages = activeConversation?.messages ?? []

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight })
  }, [messages.length, isLoading])

  const handleSend = async (content: string) => {
    setError(null)

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    }
    onAppendMessage(userMessage)

    setIsLoading(true)
    try {
      // The actual prediction is near-instant (TF-IDF + Logistic
      // Regression), which reads as suspicious/unreliable in a chat UI -
      // real chat products don't reply in under 100ms. Running the API
      // call and a randomized 2-3s delay concurrently (not stacked) means
      // the wait is at least "thinking" length, but never longer than
      // that unless the network genuinely is slower.
      const thinkingMs =
        MIN_THINKING_MS + Math.random() * (MAX_THINKING_MS - MIN_THINKING_MS)
      const [result] = await Promise.all([
        predictChat({ message: content }),
        sleep(thinkingMs),
      ])
      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: result.response,
        timestamp: new Date().toISOString(),
        detected_language: result.detected_language,
        predicted_intent: result.predicted_intent,
        response_metadata: result.processing,
      }
      onAppendMessage(assistantMessage)
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Something went wrong while contacting the chatbot. Please try again.',
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex h-full flex-1 flex-col">
      {messages.length === 0 ? (
        <EmptyState />
      ) : (
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6">
          <div className="mx-auto flex max-w-3xl flex-col gap-4">
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            {isLoading && <LoadingIndicator />}
          </div>
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="mx-auto mb-2 flex w-full max-w-3xl items-start gap-2 rounded-lg
            border border-error/30 bg-error-soft px-3 py-2 text-sm text-error"
        >
          <AlertCircle size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
          <p className="flex-1">{error}</p>
          <button
            type="button"
            onClick={() => setError(null)}
            aria-label="Dismiss error"
            className="shrink-0 rounded-md p-0.5 hover:bg-black/5"
          >
            <X size={14} />
          </button>
        </div>
      )}

      <ChatComposer onSend={handleSend} disabled={isLoading} />
    </div>
  )
}
