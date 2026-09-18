export type MessageDirection = 'incoming' | 'outgoing'

export type MessageStatus = 'pending' | 'sent' | 'delivered' | 'read' | 'failed'

export interface Message {
  id: string
  direction: MessageDirection
  text: string
  timestamp: number
  status?: MessageStatus
}

export interface Chat {
  id: string
  phone: string | null
  remoteChatId: string | null
  title: string
  messages: Message[]
  unreadCount: number
  lastActivity: number
}

export interface ChatsState {
  chats: Chat[]
  activeChatId: string | null
}

export interface IncomingMessagePayload {
  phone: string | null
  remoteChatId: string
  title: string
  message: Message
}
