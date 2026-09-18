import styles from './Avatar.module.css'

interface AvatarProps {
  title: string
  size?: 'md' | 'lg'
}

const PALETTE = ['#6c4df6', '#2f8bf0', '#1fa971', '#e0803a', '#d9435b', '#8b5cf6']

export function Avatar({ title, size = 'md' }: AvatarProps) {
  return (
    <span
      className={[styles.avatar, styles[size]].join(' ')}
      style={{ background: pickColor(title) }}
      aria-hidden
    >
      {buildInitials(title)}
    </span>
  )
}

function buildInitials(title: string): string {
  const letters = title.match(/\p{L}/gu)
  if (letters) return letters[0].toUpperCase()

  const digits = title.replace(/\D/g, '')
  return digits.slice(-2) || '#'
}

function pickColor(seed: string): string {
  const hash = [...seed].reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return PALETTE[hash % PALETTE.length]
}
