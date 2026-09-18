const timeFormatter = new Intl.DateTimeFormat('ru-RU', { hour: '2-digit', minute: '2-digit' })
const dayFormatter = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long' })
const dayWithYearFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

export function formatTime(timestampMs: number): string {
  return timeFormatter.format(timestampMs)
}

export function formatDaySeparator(timestampMs: number): string {
  const date = new Date(timestampMs)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)

  if (isSameDay(date, today)) return 'Сегодня'
  if (isSameDay(date, yesterday)) return 'Вчера'
  if (date.getFullYear() === today.getFullYear()) return dayFormatter.format(date)

  return dayWithYearFormatter.format(date)
}

export function formatChatListTime(timestampMs: number): string {
  const date = new Date(timestampMs)
  return isSameDay(date, new Date()) ? formatTime(timestampMs) : dayFormatter.format(date)
}

function isSameDay(left: Date, right: Date): boolean {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  )
}

export function startOfDay(timestampMs: number): number {
  const date = new Date(timestampMs)
  date.setHours(0, 0, 0, 0)
  return date.getTime()
}
