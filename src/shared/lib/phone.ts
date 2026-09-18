const RUSSIAN_PHONE_LENGTH = 11

export function normalizePhone(input: string): string {
  const digits = input.replace(/\D/g, '')

  if (digits.length === RUSSIAN_PHONE_LENGTH && digits.startsWith('8')) {
    return `7${digits.slice(1)}`
  }

  return digits
}

export function isValidPhone(input: string): boolean {
  const digits = normalizePhone(input)
  return digits.length >= 10 && digits.length <= 15
}

export function formatPhone(phone: string): string {
  const digits = normalizePhone(phone)

  if (digits.length !== RUSSIAN_PHONE_LENGTH || !digits.startsWith('7')) {
    return `+${digits}`
  }

  const [, code, first, second, third] = digits.match(/^7(\d{3})(\d{3})(\d{2})(\d{2})$/) ?? []
  return `+7 ${code} ${first}-${second}-${third}`
}

export function toChatId(phone: string): string {
  return `${normalizePhone(phone)}@c.us`
}
