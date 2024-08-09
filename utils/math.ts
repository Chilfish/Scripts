export const delay = (ms = 1000) => new Promise(resolve => setTimeout(resolve, ms))

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

export function uniqueObj<T extends Record<string, unknown>[]>(arr: T, key: string) {
  const map = new Map()
  arr.forEach((item) => {
    map.set(item[key], item)
  })
  return Array.from(map.values()) as T
}

export function chunkArray<T>(array: T[], size: number) {
  const result = [] as T[][]
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size))
  }
  return result
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

/**
 * format duration to hh:mm:ss
 * @param duration in seconds
 */
export function fmtDuration(duration: number) {
  const padZero = (num: number) => num.toString().padStart(2, '0')

  const hours = Math.floor(duration / 3600)
  const minutes = Math.floor((duration % 3600) / 60)
  const seconds = Math.floor(duration % 60)

  const formattedDuration = `${padZero(hours)}:${padZero(minutes)}:${padZero(seconds)}`

  return formattedDuration
}

const alphabet = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'

/**
 * Convert hex or base62 to decimal
 */
export function toDec(input: string | number | bigint) {
  if (typeof input === 'number')
    return input

  if (typeof input === 'bigint')
    return Number(input)

  if (input.startsWith('0x'))
    return Number.parseInt(input.slice(2), 16)

  if (input.startsWith('0o'))
    return Number.parseInt(input.slice(2), 8)

  if (/^[01]+$/.test(input))
    return Number.parseInt(input, 2)

  let num = 0
  for (let i = 0; i < input.length; i++) {
    const char = input[i]
    const index = alphabet.indexOf(char)
    if (index === -1)
      return Number.NaN

    num = num * 62 + index
  }
  return num
}

/**
 * Convert a number to base62
 */
export function toBase62(input: string | number | bigint) {
  let num = toDec(input)
  if (Number.isNaN(num))
    return null

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
  length = 16,
  prefix = '',
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
