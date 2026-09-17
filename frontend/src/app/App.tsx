import { useState } from 'react'
import { Sidebar, SidebarMenuButton } from '../components/Sidebar'
import { ChatView } from '../features/chat/ChatView'
import { useConversationHistory } from '../features/history/useConversationHistory'
import { DatasetInfoView } from '../features/dataset/DatasetInfoView'
import { ModelInfoView } from '../features/model/ModelInfoView'
import { PipelineExplanationView } from '../features/pipeline/PipelineExplanationView'
import type { AppView } from '../types/navigation'
import { ThemeProvider } from './ThemeProvider'

const VIEW_TITLES: Record<AppView, string> = {
  chat: 'Chat',
  dataset: 'Dataset Information',
  model: 'Model Information',
  pipeline: 'How It Works',
}

function AppShell() {
  const [activeView, setActiveView] = useState<AppView>('chat')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const {
    conversations,
    activeConversation,
    activeConversationId,
    startNewConversation,
    selectConversation,
    deleteConversation,
    appendMessage,
  } = useConversationHistory()

  return (
    <div className="flex h-dvh bg-bg">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeView={activeView}
        onNavigate={setActiveView}
        conversations={conversations}
        activeConversationId={activeConversationId}
        onNewChat={startNewConversation}
        onSelectConversation={selectConversation}
        onDeleteConversation={deleteConversation}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-2 border-b border-border px-3 py-2.5 md:hidden">
          <SidebarMenuButton onClick={() => setSidebarOpen(true)} />
          <h1 className="text-sm font-medium text-primary">{VIEW_TITLES[activeView]}</h1>
        </header>

        <main className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          {activeView === 'chat' && (
            <ChatView
              activeConversation={activeConversation}
              onAppendMessage={appendMessage}
            />
          )}
          {activeView === 'dataset' && <DatasetInfoView />}
          {activeView === 'model' && <ModelInfoView />}
          {activeView === 'pipeline' && <PipelineExplanationView />}
        </main>
      </div>
    </div>
  )
}

function App() {
  return (
    <ThemeProvider>
      <AppShell />
    </ThemeProvider>
  )
}

export default App
