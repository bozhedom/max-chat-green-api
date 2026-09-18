import { formatPhone } from '@/shared/lib/phone'
import { Avatar } from '@/shared/ui/Avatar'
import type { Chat } from '@/features/chat/model/types'
import { MessageComposer } from '@/features/chat/ui/MessageComposer'
import { MessageList } from '@/features/chat/ui/MessageList'
import styles from './ChatView.module.css'

interface ChatViewProps {
  className?: string
  chat: Chat | null
  error: string | null
  onBack: () => void
  onDismissError: () => void
  onSend: (chat: Chat, text: string) => void
}

export function ChatView({ className, chat, error, onBack, onDismissError, onSend }: ChatViewProps) {
  const rootClassName = [styles.view, className].filter(Boolean).join(' ')

  if (!chat) {
    return (
      <section className={rootClassName}>
        <div className={styles.placeholder}>
          <p className={styles.placeholderTitle}>Выберите чат</p>
          <p className={styles.placeholderText}>
            Откройте существующий диалог или создайте новый по номеру телефона
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className={rootClassName}>
      <header className={styles.header}>
        <button className={styles.back} type="button" onClick={onBack} aria-label="К списку чатов">
          <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden>
            <path
              d="M14.5 5 8 12l6.5 7"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <Avatar title={chat.title} />
        <div className={styles.meta}>
          <h2 className={styles.title}>{chat.title}</h2>
          {chat.phone && <p className={styles.phone}>{formatPhone(chat.phone)}</p>}
        </div>
      </header>

      {error && (
        <p className={styles.error} role="alert">
          {error}
          <button className={styles.dismiss} type="button" onClick={onDismissError} aria-label="Скрыть">
            ×
          </button>
        </p>
      )}

      <MessageList messages={chat.messages} />

      <MessageComposer key={chat.id} onSend={(text) => onSend(chat, text)} />
    </section>
  )
}
