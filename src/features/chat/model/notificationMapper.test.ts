import { describe, expect, it } from 'vitest'
import type { Notification } from '@/shared/api/types'
import { mapNotification } from './notificationMapper'

const incomingTextMessage: Notification = {
  typeWebhook: 'incomingMessageReceived',
  idMessage: 'BAE5F4886F6F2D05',
  timestamp: 1763115112,
  senderData: {
    chatId: '10000000',
    chatName: 'Иван Петров',
    senderName: 'Иван Петров',
    senderPhoneNumber: 79991234567,
  },
  messageData: {
    typeMessage: 'textMessage',
    textMessageData: { textMessage: 'Привет' },
  },
}

describe('mapNotification', () => {
  it('разбирает входящее текстовое сообщение', () => {
    expect(mapNotification(incomingTextMessage)).toEqual({
      kind: 'message',
      payload: {
        phone: '79991234567',
        remoteChatId: '10000000',
        title: 'Иван Петров',
        message: {
          id: 'BAE5F4886F6F2D05',
          direction: 'incoming',
          text: 'Привет',
          timestamp: 1763115112000,
          status: undefined,
        },
      },
    })
  })

  it('берёт номер из chatId, если отправитель не передан', () => {
    const event = mapNotification({
      ...incomingTextMessage,
      senderData: { chatId: '79991234567@c.us' },
    })

    expect(event).toMatchObject({ payload: { phone: '79991234567', title: '+7 999 123-45-67' } })
  })

  it('разбирает расширенное текстовое сообщение', () => {
    const event = mapNotification({
      ...incomingTextMessage,
      messageData: {
        typeMessage: 'extendedTextMessage',
        extendedTextMessageData: { text: 'Ссылка' },
      },
    })

    expect(event).toMatchObject({ payload: { message: { text: 'Ссылка' } } })
  })

  it('помечает сообщения, отправленные через API, как исходящие', () => {
    const event = mapNotification({
      ...incomingTextMessage,
      typeWebhook: 'outgoingAPIMessageReceived',
    })

    expect(event).toMatchObject({ payload: { message: { direction: 'outgoing', status: 'sent' } } })
  })

  it('превращает уведомление о статусе в изменение статуса сообщения', () => {
    expect(
      mapNotification({
        typeWebhook: 'outgoingMessageStatus',
        idMessage: 'BAE5F4886F6F2D05',
        timestamp: 1763115112,
        status: 'read',
      }),
    ).toEqual({ kind: 'status', idMessage: 'BAE5F4886F6F2D05', status: 'read' })
  })

  it('игнорирует уведомления без текста', () => {
    const event = mapNotification({
      ...incomingTextMessage,
      messageData: { typeMessage: 'imageMessage' },
    })

    expect(event).toBeNull()
  })
})
