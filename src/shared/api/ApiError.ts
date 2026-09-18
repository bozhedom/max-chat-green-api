export class ApiError extends Error {
  readonly status?: number

  constructor(message: string, status?: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

const MESSAGE_BY_STATUS: Record<number, string> = {
  400: 'Запрос отклонён: проверьте номер получателя и текст сообщения',
  401: 'Неверные idInstance или apiTokenInstance',
  403: 'Доступ запрещён: инстанс заблокирован или приостановлен',
  429: 'Превышен лимит запросов, попробуйте позже',
  466: 'Исчерпана квота тарифа GREEN-API',
}

export function toApiError(cause: unknown, status?: number): ApiError {
  if (cause instanceof ApiError) return cause

  if (status !== undefined) {
    return new ApiError(MESSAGE_BY_STATUS[status] ?? `Сервис GREEN-API вернул ошибку ${status}`, status)
  }

  return new ApiError('Не удалось связаться с GREEN-API. Проверьте подключение к сети')
}
