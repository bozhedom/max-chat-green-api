import { useCallback, useEffect, useMemo, useReducer, useState } from 'react'
import { createGreenApiClient } from '@/shared/api/greenApi'
import type { Credentials, Notification } from '@/shared/api/types'
import { normalizePhone, toChatId } from '@/shared/lib/phone'
import { chatsReducer } from './chatsReducer'
import { loadChats, saveChats } from './chatsStorage'
import { mapNotification } from './notificationMapper'
import { useNotificationStream } from './useNotificationStream'
import type { Chat } from './types'

export function useChatSession(credentials: Credentials) {
  const client = useMemo(() => createGreenApiClient(credentials), [credentials])
  const [state, dispatch] = useReducer(chatsReducer, credentials.idInstance, loadChats)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    saveChats(credentials.idInstance, state)
  }, [credentials.idInstance, state])

  const handleNotification = useCallback((notification: Notification) => {
    const event = mapNotification(notification)
    if (!event) return

    if (event.kind === 'message') {
      dispatch({ type: 'message/received', payload: event.payload })
      return
    }

    dispatch({ type: 'message/statusChanged', idMessage: event.idMessage, status: event.status })
  }, [])

  const connection = useNotificationStream(client, handleNotification)
  const activeChat = state.chats.find((chat) => chat.id === state.activeChatId) ?? null

  const openChat = useCallback((phone: string) => {
    dispatch({ type: 'chat/opened', phone: normalizePhone(phone) })
  }, [])

  const selectChat = useCallback((chatId: string) => {
    dispatch({ type: 'chat/selected', chatId })
  }, [])

  const deselectChat = useCallback(() => {
    dispatch({ type: 'chat/deselected' })
  }, [])

  const sendMessage = useCallback(
    async (chat: Chat, text: string) => {
      const localId = `local:${crypto.randomUUID()}`

      dispatch({
        type: 'message/queued',
        chatId: chat.id,
        message: { id: localId, direction: 'outgoing', text, timestamp: Date.now(), status: 'pending' },
      })

      try {
        const { idMessage } = await client.sendMessage(resolveChatId(chat), text)
        dispatch({ type: 'message/sent', chatId: chat.id, localId, idMessage })
        setError(null)
      } catch (cause) {
        dispatch({ type: 'message/failed', chatId: chat.id, localId })
        setError(cause instanceof Error ? cause.message : 'Не удалось отправить сообщение')
      }
    },
    [client],
  )

  return {
    chats: state.chats,
    activeChat,
    connection,
    error,
    openChat,
    selectChat,
    deselectChat,
    sendMessage,
    dismissError: useCallback(() => setError(null), []),
  }
}

function resolveChatId(chat: Chat): string {
  return chat.phone ? toChatId(chat.phone) : (chat.remoteChatId ?? chat.id)
}
