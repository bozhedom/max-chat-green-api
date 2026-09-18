import { useEffect, useRef, useState } from 'react'
import type { GreenApiClient } from '@/shared/api/greenApi'
import type { Notification } from '@/shared/api/types'

export type ConnectionStatus = 'connecting' | 'online' | 'offline'

const RECEIVE_TIMEOUT_SECONDS = 20
const RETRY_BASE_DELAY_MS = 1000
const RETRY_MAX_DELAY_MS = 15000

export function useNotificationStream(
  client: GreenApiClient,
  onNotification: (notification: Notification) => void,
): ConnectionStatus {
  const [status, setStatus] = useState<ConnectionStatus>('connecting')
  const handlerRef = useRef(onNotification)

  useEffect(() => {
    handlerRef.current = onNotification
  }, [onNotification])

  useEffect(() => {
    const controller = new AbortController()
    let failedAttempts = 0

    async function poll() {
      while (!controller.signal.aborted) {
        try {
          const received = await client.receiveNotification(RECEIVE_TIMEOUT_SECONDS, controller.signal)
          failedAttempts = 0
          setStatus('online')

          if (received) {
            handlerRef.current(received.body)
            await client.deleteNotification(received.receiptId, controller.signal)
          }
        } catch {
          if (controller.signal.aborted) return
          failedAttempts += 1
          setStatus('offline')
          await delay(retryDelay(failedAttempts), controller.signal)
        }
      }
    }

    void poll()

    return () => controller.abort()
  }, [client])

  return status
}

function retryDelay(attempt: number): number {
  return Math.min(RETRY_BASE_DELAY_MS * 2 ** (attempt - 1), RETRY_MAX_DELAY_MS)
}

function delay(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve) => {
    const timeout = setTimeout(resolve, ms)
    signal.addEventListener('abort', () => {
      clearTimeout(timeout)
      resolve()
    })
  })
}
