import {
  Database,
  Menu,
  MessageSquarePlus,
  Moon,
  Sparkles,
  Sun,
  Trash2,
  Workflow,
  X,
} from 'lucide-react'
import type { Conversation } from '../types/chat'
import type { AppView } from '../types/navigation'
import { useTheme } from '../hooks/useTheme'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  activeView: AppView
  onNavigate: (view: AppView) => void
  conversations: Conversation[]
  activeConversationId: string | null
  onNewChat: () => void
  onSelectConversation: (id: string) => void
  onDeleteConversation: (id: string) => void
}

const NAV_ITEMS: { view: AppView; label: string; icon: typeof Database }[] = [
  { view: 'dataset', label: 'Dataset information', icon: Database },
  { view: 'model', label: 'Model information', icon: Sparkles },
  { view: 'pipeline', label: 'How it works', icon: Workflow },
]

export function Sidebar({
  isOpen,
  onClose,
  activeView,
  onNavigate,
  conversations,
  activeConversationId,
  onNewChat,
  onSelectConversation,
  onDeleteConversation,
}: SidebarProps) {
  const { theme, toggleTheme } = useTheme()

  return (
    <>
      {/* Mobile scrim, shown only while the drawer is open */}
      {isOpen && (
        <button
          type="button"
          aria-label="Close navigation menu"
          onClick={onClose}
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[var(--sidebar-width)] flex-col
          border-r border-border bg-surface transition-transform duration-200
          md:static md:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2 font-semibold text-primary">
            <Sparkles size={20} className="text-accent" aria-hidden="true" />
            <span>Yoruba/English Chatbot</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation menu"
            className="rounded-full p-1.5 text-secondary hover:bg-surface-hover md:hidden"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-3">
          <button
            type="button"
            onClick={() => {
              onNewChat()
              onNavigate('chat')
              onClose()
            }}
            className="flex w-full items-center gap-2 rounded-full border border-border
              px-4 py-2.5 text-sm font-medium text-primary transition-colors
              hover:bg-surface-hover"
          >
            <MessageSquarePlus size={18} aria-hidden="true" />
            New chat
          </button>
        </div>

        <nav aria-label="Conversation history" className="mt-4 flex-1 overflow-y-auto px-3">
          <p className="px-2 pb-1 text-xs font-medium uppercase tracking-wide text-muted">
            Recent
          </p>
          {conversations.length === 0 ? (
            <p className="px-2 py-2 text-sm text-muted">No conversations yet.</p>
          ) : (
            <ul className="flex flex-col gap-0.5">
              {conversations.map((conversation) => (
                <li key={conversation.id} className="group relative">
                  <button
                    type="button"
                    onClick={() => {
                      onSelectConversation(conversation.id)
                      onNavigate('chat')
                      onClose()
                    }}
                    aria-current={
                      conversation.id === activeConversationId && activeView === 'chat'
                        ? 'true'
                        : undefined
                    }
                    className={`w-full truncate rounded-lg px-2 py-2 pr-8 text-left text-sm
                      transition-colors hover:bg-surface-hover
                      ${
                        conversation.id === activeConversationId && activeView === 'chat'
                          ? 'bg-surface-active text-primary'
                          : 'text-secondary'
                      }`}
                  >
                    {conversation.title}
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteConversation(conversation.id)}
                    aria-label={`Delete conversation "${conversation.title}"`}
                    className="absolute right-1 top-1/2 -translate-y-1/2 rounded-md p-1.5
                      text-muted opacity-0 transition-opacity hover:bg-surface-active
                      hover:text-error group-hover:opacity-100 focus-visible:opacity-100"
                  >
                    <Trash2 size={14} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </nav>

        <nav aria-label="Project information" className="border-t border-border px-3 py-3">
          <ul className="flex flex-col gap-0.5">
            {NAV_ITEMS.map(({ view, label, icon: Icon }) => (
              <li key={view}>
                <button
                  type="button"
                  onClick={() => {
                    onNavigate(view)
                    onClose()
                  }}
                  aria-current={activeView === view ? 'true' : undefined}
                  className={`flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-sm
                    transition-colors hover:bg-surface-hover
                    ${activeView === view ? 'bg-surface-active text-primary' : 'text-secondary'}`}
                >
                  <Icon size={16} aria-hidden="true" />
                  {label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="border-t border-border px-3 py-3">
          <button
            type="button"
            onClick={toggleTheme}
            className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-sm
              text-secondary transition-colors hover:bg-surface-hover"
          >
            {theme === 'dark' ? (
              <Sun size={16} aria-hidden="true" />
            ) : (
              <Moon size={16} aria-hidden="true" />
            )}
            {theme === 'dark' ? 'Light mode' : 'Dark mode'}
          </button>
        </div>
      </aside>
    </>
  )
}

export function SidebarMenuButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Open navigation menu"
      className="rounded-full p-2 text-secondary hover:bg-surface-hover md:hidden"
    >
      <Menu size={20} />
    </button>
  )
}
