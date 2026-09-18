import type { MessageNotification, Notification, StatusNotification } from '@/shared/api/types'
import { formatPhone, normalizePhone } from '@/shared/lib/phone'
import type { IncomingMessagePayload, MessageDirection, MessageStatus } from './types'

export type ChatEvent =
  | { kind: 'message'; payload: IncomingMessagePayload }
  | { kind: 'status'; idMessage: string; status: MessageStatus }

const DIRECTION_BY_WEBHOOK: Record<MessageNotification['typeWebhook'], MessageDirection> = {
  incomingMessageReceived: 'incoming',
  outgoingMessageReceived: 'outgoing',
  outgoingAPIMessageReceived: 'outgoing',
}

const STATUS_BY_WEBHOOK_STATUS: Partial<Record<StatusNotification['status'], MessageStatus>> = {
  sent: 'sent',
  delivered: 'delivered',
  read: 'read',
  failed: 'failed',
  noAccount: 'failed',
  notInGroup: 'failed',
}

export function mapNotification(notification: Notification): ChatEvent | null {
  if (notification.typeWebhook === 'outgoingMessageStatus') {
    const status = STATUS_BY_WEBHOOK_STATUS[notification.status]
    return status ? { kind: 'status', idMessage: notification.idMessage, status } : null
  }

  if (notification.typeWebhook === 'stateInstanceChanged') return null

  const text = extractText(notification)
  if (text === null) return null

  const { senderData } = notification
  const phone = extractPhone(notification)

  return {
    kind: 'message',
    payload: {
      phone,
      remoteChatId: senderData.chatId,
      title: buildTitle(notification, phone),
      message: {
        id: notification.idMessage,
        direction: DIRECTION_BY_WEBHOOK[notification.typeWebhook],
        text,
        timestamp: notification.timestamp * 1000,
        status: DIRECTION_BY_WEBHOOK[notification.typeWebhook] === 'outgoing' ? 'sent' : undefined,
      },
    },
  }
}

function extractText({ messageData }: MessageNotification): string | null {
  return messageData.textMessageData?.textMessage ?? messageData.extendedTextMessageData?.text ?? null
}

function extractPhone({ typeWebhook, senderData }: MessageNotification): string | null {
  const phoneFromChatId = senderData.chatId.endsWith('@c.us')
    ? normalizePhone(senderData.chatId)
    : null

  if (typeWebhook !== 'incomingMessageReceived') return phoneFromChatId

  const senderPhone = senderData.senderPhoneNumber
  return senderPhone ? normalizePhone(String(senderPhone)) : phoneFromChatId
}

function buildTitle({ typeWebhook, senderData }: MessageNotification, phone: string | null): string {
  const name =
    typeWebhook === 'incomingMessageReceived'
      ? (senderData.senderContactName ?? senderData.senderName ?? senderData.chatName)
      : senderData.chatName

  if (name) return name

  return phone ? formatPhone(phone) : senderData.chatId
}
