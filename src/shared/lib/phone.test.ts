import { describe, expect, it } from 'vitest'
import { formatPhone, isValidPhone, normalizePhone, toChatId } from './phone'

describe('normalizePhone', () => {
  it('оставляет только цифры', () => {
    expect(normalizePhone('+7 (999) 123-45-67')).toBe('79991234567')
  })

  it('приводит ведущую восьмёрку к семёрке', () => {
    expect(normalizePhone('8 999 123 45 67')).toBe('79991234567')
  })
})

describe('isValidPhone', () => {
  it('принимает международные номера', () => {
    expect(isValidPhone('79991234567')).toBe(true)
    expect(isValidPhone('+1 202 555 0143')).toBe(true)
  })

  it('отклоняет слишком короткие значения', () => {
    expect(isValidPhone('12345')).toBe(false)
    expect(isValidPhone('')).toBe(false)
  })
})

describe('formatPhone', () => {
  it('форматирует российский номер', () => {
    expect(formatPhone('79991234567')).toBe('+7 999 123-45-67')
  })

  it('оставляет остальные номера в международном виде', () => {
    expect(formatPhone('12025550143')).toBe('+12025550143')
  })
})

describe('toChatId', () => {
  it('строит идентификатор чата для GREEN-API', () => {
    expect(toChatId('8 (999) 123-45-67')).toBe('79991234567@c.us')
  })
})
