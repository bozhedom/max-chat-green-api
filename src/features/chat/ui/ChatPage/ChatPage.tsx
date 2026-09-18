import type { Credentials } from '@/shared/api/types'
import { useChatSession } from '@/features/chat/model/useChatSession'
import { ChatView } from '@/features/chat/ui/ChatView'
import { Sidebar } from '@/features/chat/ui/Sidebar'
import styles from './ChatPage.module.css'

interface ChatPageProps {
  credentials: Credentials
  onSignOut: () => void
}

export function ChatPage({ credentials, onSignOut }: ChatPageProps) {
  const {
    chats,
    activeChat,
    connection,
    error,
    openChat,
    selectChat,
    deselectChat,
    sendMessage,
    dismissError,
  } = useChatSession(credentials)

  return (
    <div className={styles.page} data-chat-open={activeChat !== null}>
      <Sidebar
        className={styles.sidebar}
        chats={chats}
        activeChatId={activeChat?.id ?? null}
        connection={connection}
        idInstance={credentials.idInstance}
        onCreateChat={openChat}
        onSelectChat={selectChat}
        onSignOut={onSignOut}
      />

      <ChatView
        className={styles.chat}
        chat={activeChat}
        error={error}
        onBack={deselectChat}
        onDismissError={dismissError}
        onSend={sendMessage}
      />
    </div>
  )
}
