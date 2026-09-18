import { useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import styles from './MessageComposer.module.css'

const MAX_MESSAGE_LENGTH = 4000

interface MessageComposerProps {
  onSend: (text: string) => void
}

export function MessageComposer({ onSend }: MessageComposerProps) {
  const [text, setText] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  function handleSubmit(event?: FormEvent) {
    event?.preventDefault()

    const trimmed = text.trim()
    if (!trimmed) return

    onSend(trimmed)
    setText('')
    resetHeight()
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleSubmit()
    }
  }

  function resetHeight() {
    const textarea = textareaRef.current
    if (!textarea) return

    textarea.style.height = 'auto'
    textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`
  }

  return (
    <form className={styles.composer} onSubmit={handleSubmit}>
      <textarea
        ref={textareaRef}
        className={styles.input}
        value={text}
        onChange={(event) => {
          setText(event.target.value)
          resetHeight()
        }}
        onKeyDown={handleKeyDown}
        placeholder="Написать сообщение"
        aria-label="Текст сообщения"
        maxLength={MAX_MESSAGE_LENGTH}
        rows={1}
      />
      <button className={styles.send} type="submit" disabled={text.trim() === ''} aria-label="Отправить">
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden>
          <path
            d="M4 12 20 5l-7 15-2.2-6.2z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </form>
  )
}
