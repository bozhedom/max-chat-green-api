import { toApiError } from './ApiError'
import type {
  Credentials,
  ReceivedNotification,
  SendMessageResponse,
  StateInstanceResponse,
} from './types'

export const DEFAULT_API_URL = 'https://api.green-api.com'

interface RequestOptions {
  method?: 'GET' | 'POST' | 'DELETE'
  body?: unknown
  query?: Record<string, string | number>
  pathSuffix?: string
  signal?: AbortSignal
}

function buildUrl(credentials: Credentials, method: string, options: RequestOptions): string {
  const base = credentials.apiUrl.replace(/\/+$/, '')
  const suffix = options.pathSuffix ? `/${options.pathSuffix}` : ''
  const url = new URL(
    `${base}/waInstance${credentials.idInstance}/${method}/${credentials.apiTokenInstance}${suffix}`,
  )

  for (const [key, value] of Object.entries(options.query ?? {})) {
    url.searchParams.set(key, String(value))
  }

  return url.toString()
}

async function request<T>(
  credentials: Credentials,
  apiMethod: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = 'GET', body, signal } = options

  let response: Response

  try {
    response = await fetch(buildUrl(credentials, apiMethod, options), {
      method,
      signal,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch (cause) {
    if (signal?.aborted) throw cause
    throw toApiError(cause)
  }

  if (!response.ok) throw toApiError(undefined, response.status)

  const text = await response.text()
  return (text ? JSON.parse(text) : null) as T
}

export function createGreenApiClient(credentials: Credentials) {
  return {
    getStateInstance: (signal?: AbortSignal) =>
      request<StateInstanceResponse>(credentials, 'getStateInstance', { signal }),

    sendMessage: (chatId: string, message: string, signal?: AbortSignal) =>
      request<SendMessageResponse>(credentials, 'sendMessage', {
        method: 'POST',
        body: { chatId, message },
        signal,
      }),

    receiveNotification: (receiveTimeoutSeconds: number, signal?: AbortSignal) =>
      request<ReceivedNotification | null>(credentials, 'receiveNotification', {
        query: { receiveTimeout: receiveTimeoutSeconds },
        signal,
      }),

    deleteNotification: (receiptId: number, signal?: AbortSignal) =>
      request<unknown>(credentials, 'deleteNotification', {
        method: 'DELETE',
        pathSuffix: String(receiptId),
        signal,
      }),
  }
}

export type GreenApiClient = ReturnType<typeof createGreenApiClient>
