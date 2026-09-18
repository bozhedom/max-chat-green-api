import type { ConnectionStatus } from '@/features/chat/model/useNotificationStream'
import styles from './ConnectionBadge.module.css'

const LABELS: Record<ConnectionStatus, string> = {
  connecting: 'Подключение',
  online: 'На связи',
  offline: 'Нет связи',
}

export function ConnectionBadge({ status }: { status: ConnectionStatus }) {
  return (
    <span className={styles.badge} data-status={status}>
      <span className={styles.dot} aria-hidden />
      {LABELS[status]}
    </span>
  )
}
