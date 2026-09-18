import { readStorage, writeStorage } from '@/shared/lib/storage'
import { initialChatsState } from './chatsReducer'
import type { ChatsState } from './types'

const MAX_STORED_MESSAGES_PER_CHAT = 200

const storageKey = (idInstance: string) => `max-chat:chats:${idInstance}`

export function loadChats(idInstance: string): ChatsState {
  const stored = readStorage<ChatsState>(storageKey(idInstance))
  if (!stored?.chats) return initialChatsState

  return { chats: stored.chats, activeChatId: null }
}

export function saveChats(idInstance: string, state: ChatsState): void {
  const chats = state.chats.map((chat) => ({
    ...chat,
    messages: chat.messages.slice(-MAX_STORED_MESSAGES_PER_CHAT),
  }))

  writeStorage(storageKey(idInstance), { ...state, chats })
}
