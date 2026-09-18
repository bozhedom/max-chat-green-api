import { useState, type FormEvent } from 'react'
import { isValidPhone } from '@/shared/lib/phone'
import styles from './NewChatForm.module.css'

interface NewChatFormProps {
  onSubmit: (phone: string) => void
}

export function NewChatForm({ onSubmit }: NewChatFormProps) {
  const [phone, setPhone] = useState('')
  const [isTouched, setIsTouched] = useState(false)

  const isValid = isValidPhone(phone)
  const showError = isTouched && phone !== '' && !isValid

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!isValid) {
      setIsTouched(true)
      return
    }

    onSubmit(phone)
    setPhone('')
    setIsTouched(false)
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.row}>
        <input
          className={styles.input}
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          onBlur={() => setIsTouched(true)}
          placeholder="Номер телефона получателя"
          inputMode="tel"
          aria-label="Номер телефона получателя"
          aria-invalid={showError}
        />
        <button className={styles.submit} type="submit" aria-label="Создать чат">
          +
        </button>
      </div>
      {showError && <p className={styles.error}>Введите номер в формате 79991234567</p>}
    </form>
  )
}
