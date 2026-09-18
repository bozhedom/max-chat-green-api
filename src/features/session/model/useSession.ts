import { useCallback, useState } from 'react'
import type { Credentials } from '@/shared/api/types'
import { readStorage, removeStorage, writeStorage } from '@/shared/lib/storage'

const SESSION_KEY = 'max-chat:session'

export function useSession() {
  const [credentials, setCredentials] = useState<Credentials | null>(() =>
    readStorage<Credentials>(SESSION_KEY),
  )

  const signIn = useCallback((next: Credentials) => {
    writeStorage(SESSION_KEY, next)
    setCredentials(next)
  }, [])

  const signOut = useCallback(() => {
    removeStorage(SESSION_KEY)
    setCredentials(null)
  }, [])

  return { credentials, signIn, signOut }
}
