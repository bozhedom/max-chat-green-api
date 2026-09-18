import { describe, expect, it } from 'vitest'
import { chatsReducer, initialChatsState } from './chatsReducer'
import type { ChatsState, IncomingMessagePayload } from './types'

const PHONE = '79991234567'
const REMOTE_CHAT_ID = '10000000'

function stateWithChat(): ChatsState {
  return chatsReducer(initialChatsState, { type: 'chat/opened', phone: PHONE })
}

function incomingPayload(overrides: Partial<IncomingMessagePayload> = {}): IncomingMessagePayload {
  return {
    phone: PHONE,
    remoteChatId: REMOTE_CHAT_ID,
    title: 'Иван Петров',
    message: { id: 'incoming-1', direction: 'incoming', text: 'Привет', timestamp: 1763115112000 },
    ...overrides,
  }
}

describe('chatsReducer', () => {
  it('создаёт чат по номеру телефона и делает его активным', () => {
    const state = stateWithChat()

    expect(state.chats).toHaveLength(1)
    expect(state.activeChatId).toBe(PHONE)
    expect(state.chats[0]).toMatchObject({ phone: PHONE, title: '+7 999 123-45-67' })
  })

  it('не создаёт дубликат при повторном открытии того же номера', () => {
    const state = chatsReducer(stateWithChat(), { type: 'chat/opened', phone: PHONE })

    expect(state.chats).toHaveLength(1)
  })

  it('заменяет локальный идентификатор сообщения на идентификатор GREEN-API', () => {
    const queued = chatsReducer(stateWithChat(), {
      type: 'message/queued',
      chatId: PHONE,
      message: { id: 'local:1', direction: 'outgoing', text: 'Привет', timestamp: 1, status: 'pending' },
    })

    const sent = chatsReducer(queued, {
      type: 'message/sent',
      chatId: PHONE,
      localId: 'local:1',
      idMessage: 'BAE5F4886F6F2D05',
    })

    expect(sent.chats[0].messages[0]).toMatchObject({ id: 'BAE5F4886F6F2D05', status: 'sent' })
  })

  it('связывает входящее сообщение с чатом по номеру телефона', () => {
    const state = chatsReducer(stateWithChat(), { type: 'message/received', payload: incomingPayload() })

    expect(state.chats).toHaveLength(1)
    expect(state.chats[0].remoteChatId).toBe(REMOTE_CHAT_ID)
    expect(state.chats[0].messages).toHaveLength(1)
  })

  it('подставляет имя отправителя вместо номера в заголовке чата', () => {
    const state = chatsReducer(stateWithChat(), { type: 'message/received', payload: incomingPayload() })

    expect(state.chats[0].title).toBe('Иван Петров')
  })

  it('связывает входящее сообщение по идентификатору чата MAX, когда номер неизвестен', () => {
    const withRemoteId = chatsReducer(stateWithChat(), {
      type: 'message/received',
      payload: incomingPayload(),
    })

    const state = chatsReducer(withRemoteId, {
      type: 'message/received',
      payload: incomingPayload({
        phone: null,
        message: { id: 'incoming-2', direction: 'incoming', text: 'Ещё', timestamp: 2 },
      }),
    })

    expect(state.chats).toHaveLength(1)
    expect(state.chats[0].messages).toHaveLength(2)
  })

  it('пропускает повторное уведомление об уже показанном сообщении', () => {
    const received = chatsReducer(stateWithChat(), {
      type: 'message/received',
      payload: incomingPayload(),
    })

    const duplicated = chatsReducer(received, { type: 'message/received', payload: incomingPayload() })

    expect(duplicated).toBe(received)
  })

  it('создаёт чат для сообщения от неизвестного отправителя', () => {
    const state = chatsReducer(initialChatsState, {
      type: 'message/received',
      payload: incomingPayload(),
    })

    expect(state.chats).toHaveLength(1)
    expect(state.chats[0].id).toBe(PHONE)
  })

  it('считает непрочитанные сообщения в неактивном чате и сбрасывает счётчик при выборе', () => {
    const opened = chatsReducer(stateWithChat(), { type: 'chat/deselected' })
    const received = chatsReducer(opened, { type: 'message/received', payload: incomingPayload() })

    expect(received.chats[0].unreadCount).toBe(1)

    const selected = chatsReducer(received, { type: 'chat/selected', chatId: PHONE })

    expect(selected.chats[0].unreadCount).toBe(0)
  })

  it('обновляет статус доставки сообщения', () => {
    const queued = chatsReducer(stateWithChat(), {
      type: 'message/queued',
      chatId: PHONE,
      message: { id: 'BAE5', direction: 'outgoing', text: 'Привет', timestamp: 1, status: 'sent' },
    })

    const state = chatsReducer(queued, {
      type: 'message/statusChanged',
      idMessage: 'BAE5',
      status: 'read',
    })

    expect(state.chats[0].messages[0].status).toBe('read')
  })
})
