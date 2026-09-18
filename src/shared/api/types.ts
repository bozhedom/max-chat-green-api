export interface Credentials {
  apiUrl: string
  idInstance: string
  apiTokenInstance: string
}

export type InstanceState =
  | 'authorized'
  | 'notAuthorized'
  | 'blocked'
  | 'starting'
  | 'suspended'
  | 'pendingPassword'

export interface StateInstanceResponse {
  stateInstance: InstanceState
}

export interface SendMessageResponse {
  idMessage: string
}

export interface SenderData {
  chatId: string
  chatName?: string
  sender?: string
  senderName?: string
  senderContactName?: string
  senderPhoneNumber?: number | string
}

export interface TextMessageData {
  typeMessage: string
  textMessageData?: { textMessage: string }
  extendedTextMessageData?: { text: string }
}

export interface MessageNotification {
  typeWebhook: 'incomingMessageReceived' | 'outgoingMessageReceived' | 'outgoingAPIMessageReceived'
  idMessage: string
  timestamp: number
  senderData: SenderData
  messageData: TextMessageData
}

export interface StatusNotification {
  typeWebhook: 'outgoingMessageStatus'
  idMessage: string
  timestamp: number
  status: 'sent' | 'delivered' | 'read' | 'failed' | 'noAccount' | 'notInGroup'
  chatId?: string
}

export interface StateNotification {
  typeWebhook: 'stateInstanceChanged'
  stateInstance: InstanceState
  timestamp: number
}

export type Notification = MessageNotification | StatusNotification | StateNotification

export interface ReceivedNotification {
  receiptId: number
  body: Notification
}
