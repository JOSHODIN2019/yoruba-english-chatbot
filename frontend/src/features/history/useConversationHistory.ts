import { useCallback, useEffect, useRef, useState } from 'react'
import type { ChatMessage, Conversation } from '../../types/chat'

const STORAGE_KEY = 'yoruba-chatbot-conversations'
const MAX_TITLE_LENGTH = 40

function loadConversations(): Conversation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as Conversation[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    // Corrupted or inaccessible storage: fail safe to an empty history
    // rather than crashing the app.
    return []
  }
}

function saveConversations(conversations: Conversation[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations))
  } catch {
    // Storage full or unavailable (e.g. private browsing) - history simply
    // won't persist across reloads; not a fatal error for the chat itself.
  }
}

function makeTitle(firstMessage: string): string {
  const trimmed = firstMessage.trim()
  return trimmed.length > MAX_TITLE_LENGTH
    ? `${trimmed.slice(0, MAX_TITLE_LENGTH)}…`
    : trimmed || 'New conversation'
}

export function useConversationHistory() {
  const [conversations, setConversations] = useState<Conversation[]>(() =>
    loadConversations(),
  )
  const [activeConversationId, setActiveConversationId] = useState<string | null>(
    null,
  )

  // React state updates are not synchronous: within a single async
  // handleSend (send user message, await the API, then append the
  // assistant's reply), a state-based activeConversationId read by the
  // second append would still see the value from BEFORE the first append
  // updated it, causing the assistant reply to start a second, separate
  // conversation instead of joining the one the user's message just
  // created. A ref is always current, even mid-async-function, so both
  // appends within the same turn agree on the same conversation.
  const activeConversationIdRef = useRef<string | null>(null)

  const setActiveId = useCallback((id: string | null) => {
    activeConversationIdRef.current = id
    setActiveConversationId(id)
  }, [])

  useEffect(() => {
    saveConversations(conversations)
  }, [conversations])

  const activeConversation =
    conversations.find((c) => c.id === activeConversationId) ?? null

  const startNewConversation = useCallback(() => {
    setActiveId(null)
  }, [setActiveId])

  const selectConversation = useCallback(
    (id: string) => {
      setActiveId(id)
    },
    [setActiveId],
  )

  const deleteConversation = useCallback(
    (id: string) => {
      setConversations((prev) => prev.filter((c) => c.id !== id))
      if (activeConversationIdRef.current === id) {
        setActiveId(null)
      }
    },
    [setActiveId],
  )

  /** Appends a message, creating a new conversation on the first message
   * of a fresh chat (when no conversation is currently active). Reads/writes
   * activeConversationIdRef (not the state variable) so two calls in a row
   * within the same async function - e.g. the user's message, then the
   * assistant's reply - always agree on which conversation they belong to. */
  const appendMessage = useCallback((message: ChatMessage) => {
    const now = new Date().toISOString()
    const targetId = activeConversationIdRef.current

    if (targetId) {
      setConversations((prev) =>
        prev.map((c) =>
          c.id === targetId
            ? { ...c, messages: [...c.messages, message], updated_at: now }
            : c,
        ),
      )
      return
    }

    // No active conversation: create one. This happens OUTSIDE the
    // setConversations updater (not nested inside it), because React
    // Strict Mode intentionally invokes updater functions twice in
    // development to catch impure ones. Generating a fresh
    // crypto.randomUUID() and calling setActiveConversationId from
    // inside the updater meant the second, throwaway invocation could
    // produce a different id than the one actually kept - leaving
    // activeConversationId pointing at a conversation that isn't in the
    // array, so nothing ever rendered. The updater below is now pure: it
    // only uses an object already created outside it.
    const newConversation: Conversation = {
      id: crypto.randomUUID(),
      title: makeTitle(message.content),
      created_at: now,
      updated_at: now,
      messages: [message],
    }
    activeConversationIdRef.current = newConversation.id
    setActiveConversationId(newConversation.id)
    setConversations((prev) => [newConversation, ...prev])
  }, [])

  return {
    conversations,
    activeConversation,
    activeConversationId,
    startNewConversation,
    selectConversation,
    deleteConversation,
    appendMessage,
  }
}
