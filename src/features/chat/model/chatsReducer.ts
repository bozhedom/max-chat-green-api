import { formatPhone } from '@/shared/lib/phone'
import type { Chat, ChatsState, IncomingMessagePayload, Message, MessageStatus } from './types'

export const initialChatsState: ChatsState = { chats: [], activeChatId: null }

export type ChatsAction =
  | { type: 'chats/restored'; state: ChatsState }
  | { type: 'chat/opened'; phone: string }
  | { type: 'chat/selected'; chatId: string }
  | { type: 'chat/deselected' }
  | { type: 'message/queued'; chatId: string; message: Message }
  | { type: 'message/sent'; chatId: string; localId: string; idMessage: string }
  | { type: 'message/failed'; chatId: string; localId: string }
  | { type: 'message/received'; payload: IncomingMessagePayload }
  | { type: 'message/statusChanged'; idMessage: string; status: MessageStatus }

export function chatsReducer(state: ChatsState, action: ChatsAction): ChatsState {
  switch (action.type) {
    case 'chats/restored':
      return action.state

    case 'chat/opened': {
      const existing = state.chats.find((chat) => chat.phone === action.phone)
      if (existing) return { ...state, activeChatId: existing.id, chats: markRead(state.chats, existing.id) }

      const chat = createChat({
        id: action.phone,
        phone: action.phone,
        remoteChatId: null,
        title: formatPhone(action.phone),
      })

      return { chats: sortChats([chat, ...state.chats]), activeChatId: chat.id }
    }

    case 'chat/selected':
      return { ...state, activeChatId: action.chatId, chats: markRead(state.chats, action.chatId) }

    case 'chat/deselected':
      return { ...state, activeChatId: null }

    case 'message/queued':
      return updateChat(state, action.chatId, (chat) => appendMessage(chat, action.message))

    case 'message/sent':
      return updateChat(state, action.chatId, (chat) => ({
        ...chat,
        messages: chat.messages.map((message) =>
          message.id === action.localId ? { ...message, id: action.idMessage, status: 'sent' } : message,
        ),
      }))

    case 'message/failed':
      return updateChat(state, action.chatId, (chat) => ({
        ...chat,
        messages: chat.messages.map((message) =>
          message.id === action.localId ? { ...message, status: 'failed' } : message,
        ),
      }))

    case 'message/received':
      return receiveMessage(state, action.payload)

    case 'message/statusChanged':
      return {
        ...state,
        chats: state.chats.map((chat) => ({
          ...chat,
          messages: chat.messages.map((message) =>
            message.id === action.idMessage ? { ...message, status: action.status } : message,
          ),
        })),
      }
  }
}

function receiveMessage(state: ChatsState, payload: IncomingMessagePayload): ChatsState {
  const target = findChat(state.chats, payload)

  if (!target) {
    const chat = createChat({
      id: payload.phone ?? payload.remoteChatId,
      phone: payload.phone,
      remoteChatId: payload.remoteChatId,
      title: payload.title,
    })

    return { ...state, chats: sortChats([appendMessage(chat, payload.message), ...state.chats]) }
  }

  if (target.messages.some((message) => message.id === payload.message.id)) return state

  const isUnread = payload.message.direction === 'incoming' && state.activeChatId !== target.id

  return updateChat(state, target.id, (chat) =>
    appendMessage(
      {
        ...chat,
        remoteChatId: chat.remoteChatId ?? payload.remoteChatId,
        title: hasCustomTitle(chat) ? chat.title : payload.title,
        unreadCount: isUnread ? chat.unreadCount + 1 : chat.unreadCount,
      },
      payload.message,
    ),
  )
}

function hasCustomTitle(chat: Chat): boolean {
  return chat.phone === null || chat.title !== formatPhone(chat.phone)
}

function findChat(chats: Chat[], payload: IncomingMessagePayload): Chat | undefined {
  return chats.find(
    (chat) =>
      (payload.phone !== null && chat.phone === payload.phone) ||
      chat.remoteChatId === payload.remoteChatId ||
      chat.id === payload.remoteChatId,
  )
}

function createChat(chat: Pick<Chat, 'id' | 'phone' | 'remoteChatId' | 'title'>): Chat {
  return { ...chat, messages: [], unreadCount: 0, lastActivity: Date.now() }
}

function appendMessage(chat: Chat, message: Message): Chat {
  const messages = [...chat.messages, message].sort((left, right) => left.timestamp - right.timestamp)
  return { ...chat, messages, lastActivity: Math.max(chat.lastActivity, message.timestamp) }
}

function updateChat(state: ChatsState, chatId: string, update: (chat: Chat) => Chat): ChatsState {
  const chats = state.chats.map((chat) => (chat.id === chatId ? update(chat) : chat))
  return { ...state, chats: sortChats(chats) }
}

function markRead(chats: Chat[], chatId: string): Chat[] {
  return chats.map((chat) => (chat.id === chatId ? { ...chat, unreadCount: 0 } : chat))
}

function sortChats(chats: Chat[]): Chat[] {
  return [...chats].sort((left, right) => right.lastActivity - left.lastActivity)
}
