export const randomInt = (min = 0, max = 100) => Math.floor(Math.random() * (max - min + 1)) + min

export const randomBool = (rate = 0.5) => Math.random() < rate

export function randomItem<T>(arr: T[]) {
  return arr[randomInt(0, arr.length - 1)]
}

export function randomDate(start?: Date, end?: Date) {
  start = start || new Date(0)
  end = end || new Date()

  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
}

export function fmtFileSize(size: number) {
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let i = 0

  while (size > 1024) {
    size /= 1024
    i++
  }

  return `${size.toFixed(2)} ${units[i]}`
}

const alphabet = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'

/**
 * Convert a number to base62
 */
export function toBase62(input: string | number) {
  let num = +input
  let base62 = ''
  do {
    base62 = alphabet[num % 62] + base62
    num = Math.floor(num / 62)
  } while (num)
  return base62
}

export function shuffleArray<T>(arr: T[]) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = randomInt(0, i)
    const temp = arr[i]
    arr[i] = arr[j]
    arr[j] = temp
  }
  return arr
}

export function genToken(
  prefix = '',
  length = 16,
) {
  let token = Date.now().toString(36)

  for (let i = 0; i < length; i++) {
    const rand = randomInt(0, alphabet.length - 1)
    token += alphabet[rand]
  }

  token = shuffleArray(token.split(''))
    .join('')
    .slice(0, length)

  return prefix ? `${prefix}-${token}` : token
}
