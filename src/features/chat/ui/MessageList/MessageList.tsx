import { useEffect, useRef } from 'react'
import { formatDaySeparator, startOfDay } from '@/shared/lib/datetime'
import type { Message } from '@/features/chat/model/types'
import { MessageBubble } from '@/features/chat/ui/MessageBubble'
import styles from './MessageList.module.css'

interface MessageListProps {
  messages: Message[]
}

export function MessageList({ messages }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' })
  }, [messages])

  if (messages.length === 0) {
    return <div className={styles.empty}>Сообщений пока нет. Напишите первым</div>
  }

  return (
    <div className={styles.list}>
      {groupByDay(messages).map(({ day, dayMessages }) => (
        <section className={styles.day} key={day}>
          <h3 className={styles.separator}>{formatDaySeparator(day)}</h3>
          {dayMessages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
        </section>
      ))}
      <div ref={bottomRef} />
    </div>
  )
}

function groupByDay(messages: Message[]): { day: number; dayMessages: Message[] }[] {
  const groups: { day: number; dayMessages: Message[] }[] = []

  for (const message of messages) {
    const day = startOfDay(message.timestamp)
    const lastGroup = groups.at(-1)

    if (lastGroup?.day === day) {
      lastGroup.dayMessages.push(message)
      continue
    }

    groups.push({ day, dayMessages: [message] })
  }

  return groups
}
