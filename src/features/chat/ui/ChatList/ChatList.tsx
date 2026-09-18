import { formatChatListTime } from '@/shared/lib/datetime'
import { Avatar } from '@/shared/ui/Avatar'
import type { Chat } from '@/features/chat/model/types'
import styles from './ChatList.module.css'

interface ChatListProps {
  chats: Chat[]
  activeChatId: string | null
  onSelect: (chatId: string) => void
}

export function ChatList({ chats, activeChatId, onSelect }: ChatListProps) {
  if (chats.length === 0) {
    return (
      <p className={styles.empty}>
        Чатов пока нет. Введите номер телефона получателя, чтобы начать переписку
      </p>
    )
  }

  return (
    <ul className={styles.list}>
      {chats.map((chat) => (
        <li key={chat.id}>
          <button
            className={styles.item}
            type="button"
            onClick={() => onSelect(chat.id)}
            aria-current={chat.id === activeChatId}
          >
            <Avatar title={chat.title} />

            <span className={styles.content}>
              <span className={styles.row}>
                <span className={styles.title}>{chat.title}</span>
                <span className={styles.time}>{formatChatListTime(chat.lastActivity)}</span>
              </span>

              <span className={styles.row}>
                <span className={styles.preview}>{lastMessagePreview(chat)}</span>
                {chat.unreadCount > 0 && <span className={styles.unread}>{chat.unreadCount}</span>}
              </span>
            </span>
          </button>
        </li>
      ))}
    </ul>
  )
}

function lastMessagePreview(chat: Chat): string {
  const lastMessage = chat.messages.at(-1)
  if (!lastMessage) return 'Нет сообщений'

  return lastMessage.direction === 'outgoing' ? `Вы: ${lastMessage.text}` : lastMessage.text
}
