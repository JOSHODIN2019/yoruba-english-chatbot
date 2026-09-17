import { act, renderHook } from '@testing-library/react'
import { StrictMode } from 'react'
import { beforeEach, describe, expect, it } from 'vitest'
import type { ChatMessage } from '../../types/chat'
import { useConversationHistory } from './useConversationHistory'

function makeMessage(role: 'user' | 'assistant', content: string): ChatMessage {
  return {
    id: crypto.randomUUID(),
    role,
    content,
    timestamp: new Date().toISOString(),
  }
}

beforeEach(() => {
  localStorage.clear()
})

describe('useConversationHistory', () => {
  // Regression test for the bug reported by the project owner: "I am not
  // seeing any chat when I send a chat." Root cause was a side effect
  // (crypto.randomUUID() + setActiveConversationId) nested inside the
  // setConversations updater function. React's StrictMode intentionally
  // invokes updater functions twice in development to catch exactly this
  // kind of impurity, so this test renders with StrictMode on - the same
  // as the real app in main.tsx - to actually exercise that behavior
  // rather than assume the fix holds.
  it('keeps both the user message and the assistant reply visible in the same conversation under StrictMode double-invocation', () => {
    const { result } = renderHook(() => useConversationHistory(), {
      wrapper: StrictMode,
    })

    // Mirrors ChatView.handleSend: append the user's message, then
    // (as if after an awaited API call) append the assistant's reply.
    act(() => {
      result.current.appendMessage(makeMessage('user', 'Hello'))
    })
    act(() => {
      result.current.appendMessage(
        makeMessage('assistant', 'Hello! How can I help you?'),
      )
    })

    expect(result.current.conversations).toHaveLength(1)
    expect(result.current.activeConversation).not.toBeNull()
    expect(result.current.activeConversation?.messages).toHaveLength(2)
    expect(result.current.activeConversation?.messages[0].content).toBe('Hello')
    expect(result.current.activeConversation?.messages[1].content).toBe(
      'Hello! How can I help you?',
    )
    // The active id must actually match a conversation that exists - this
    // is exactly what broke before: the id pointed at a UUID from a
    // discarded double-invocation, matching nothing in the array.
    expect(result.current.activeConversationId).toBe(
      result.current.conversations[0].id,
    )
  })

  it('starts a second conversation only when startNewConversation is called', () => {
    const { result } = renderHook(() => useConversationHistory(), {
      wrapper: StrictMode,
    })

    act(() => {
      result.current.appendMessage(makeMessage('user', 'First chat'))
    })
    act(() => {
      result.current.startNewConversation()
    })
    act(() => {
      result.current.appendMessage(makeMessage('user', 'Second chat'))
    })

    expect(result.current.conversations).toHaveLength(2)
    expect(result.current.activeConversation?.messages[0].content).toBe(
      'Second chat',
    )
  })
})
