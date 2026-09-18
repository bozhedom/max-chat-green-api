import { formatTime } from '@/shared/lib/datetime'
import type { Message, MessageStatus } from '@/features/chat/model/types'
import styles from './MessageBubble.module.css'

const STATUS_LABEL: Record<MessageStatus, string> = {
  pending: 'Отправляется',
  sent: 'Отправлено',
  delivered: 'Доставлено',
  read: 'Прочитано',
  failed: 'Не отправлено',
}

export function MessageBubble({ message }: { message: Message }) {
  return (
    <article className={styles.bubble} data-direction={message.direction} data-status={message.status}>
      <p className={styles.text}>{message.text}</p>
      <footer className={styles.footer}>
        {message.status && <span className={styles.status}>{STATUS_LABEL[message.status]}</span>}
        <time dateTime={new Date(message.timestamp).toISOString()}>{formatTime(message.timestamp)}</time>
      </footer>
    </article>
  )
}
