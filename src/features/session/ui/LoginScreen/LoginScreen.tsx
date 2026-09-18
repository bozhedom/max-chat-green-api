import { useState, type FormEvent } from 'react'
import { createGreenApiClient, DEFAULT_API_URL } from '@/shared/api/greenApi'
import type { Credentials, InstanceState } from '@/shared/api/types'
import { Button } from '@/shared/ui/Button'
import { TextField } from '@/shared/ui/TextField'
import styles from './LoginScreen.module.css'

interface LoginScreenProps {
  onSignIn: (credentials: Credentials) => void
}

const UNAVAILABLE_STATE_MESSAGE: Partial<Record<InstanceState, string>> = {
  notAuthorized: 'Инстанс не авторизован в MAX. Завершите авторизацию в личном кабинете GREEN-API',
  blocked: 'Инстанс заблокирован. Обратитесь в поддержку GREEN-API',
  starting: 'Инстанс запускается, попробуйте через минуту',
  suspended: 'Инстанс приостановлен. Проверьте состояние аккаунта GREEN-API',
  pendingPassword: 'Инстанс ожидает ввод пароля двухфакторной аутентификации',
}

export function LoginScreen({ onSignIn }: LoginScreenProps) {
  const [idInstance, setIdInstance] = useState('')
  const [apiTokenInstance, setApiTokenInstance] = useState('')
  const [apiUrl, setApiUrl] = useState(DEFAULT_API_URL)
  const [error, setError] = useState<string | null>(null)
  const [isChecking, setIsChecking] = useState(false)

  const isFilled = idInstance.trim() !== '' && apiTokenInstance.trim() !== ''

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!isFilled || isChecking) return

    const credentials: Credentials = {
      apiUrl: apiUrl.trim() || DEFAULT_API_URL,
      idInstance: idInstance.trim(),
      apiTokenInstance: apiTokenInstance.trim(),
    }

    setIsChecking(true)
    setError(null)

    try {
      const { stateInstance } = await createGreenApiClient(credentials).getStateInstance()
      const stateError = UNAVAILABLE_STATE_MESSAGE[stateInstance]

      if (stateError) {
        setError(stateError)
        return
      }

      onSignIn(credentials)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Не удалось подключиться к GREEN-API')
    } finally {
      setIsChecking(false)
    }
  }

  return (
    <main className={styles.screen}>
      <form className={styles.card} onSubmit={handleSubmit}>
        <header className={styles.header}>
          <h1 className={styles.title}>MAX Chat</h1>
          <p className={styles.subtitle}>
            Введите данные инстанса GREEN-API, чтобы переписываться в MAX прямо из браузера
          </p>
        </header>

        <TextField
          label="idInstance"
          value={idInstance}
          onChange={(event) => setIdInstance(event.target.value)}
          placeholder="1101000001"
          inputMode="numeric"
          autoComplete="off"
          autoFocus
        />

        <TextField
          label="apiTokenInstance"
          value={apiTokenInstance}
          onChange={(event) => setApiTokenInstance(event.target.value)}
          placeholder="d75b3a66374942c5b3c019c698abc2067e151558acbd412345"
          type="password"
          autoComplete="off"
        />

        <TextField
          label="apiUrl"
          value={apiUrl}
          onChange={(event) => setApiUrl(event.target.value)}
          placeholder={DEFAULT_API_URL}
          hint="Адрес API из личного кабинета. Оставьте значение по умолчанию, если не уверены"
          autoComplete="off"
        />

        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}

        <Button type="submit" disabled={!isFilled} loading={isChecking}>
          Войти
        </Button>

        <p className={styles.note}>
          Данные хранятся только в вашем браузере и отправляются напрямую в GREEN-API
        </p>
      </form>
    </main>
  )
}
