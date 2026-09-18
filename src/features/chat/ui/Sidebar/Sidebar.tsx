import type { ConnectionStatus } from '@/features/chat/model/useNotificationStream'
import type { Chat } from '@/features/chat/model/types'
import { ChatList } from '@/features/chat/ui/ChatList'
import { ConnectionBadge } from '@/features/chat/ui/ConnectionBadge'
import { NewChatForm } from '@/features/chat/ui/NewChatForm'
import styles from './Sidebar.module.css'

interface SidebarProps {
  className?: string
  chats: Chat[]
  activeChatId: string | null
  connection: ConnectionStatus
  idInstance: string
  onCreateChat: (phone: string) => void
  onSelectChat: (chatId: string) => void
  onSignOut: () => void
}

export function Sidebar({
  className,
  chats,
  activeChatId,
  connection,
  idInstance,
  onCreateChat,
  onSelectChat,
  onSignOut,
}: SidebarProps) {
  return (
    <aside className={[styles.sidebar, className].filter(Boolean).join(' ')}>
      <header className={styles.header}>
        <div className={styles.account}>
          <h1 className={styles.title}>MAX Chat</h1>
          <p className={styles.instance}>Инстанс {idInstance}</p>
        </div>
        <div className={styles.actions}>
          <ConnectionBadge status={connection} />
          <button className={styles.signOut} type="button" onClick={onSignOut}>
            Выйти
          </button>
        </div>
      </header>

      <NewChatForm onSubmit={onCreateChat} />

      <ChatList chats={chats} activeChatId={activeChatId} onSelect={onSelectChat} />
    </aside>
  )
}
