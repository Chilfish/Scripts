import { consola } from 'consola'
import { isMacOS, isWindows } from 'std-env'

export * from './math'
export * from './fetch'
export * from './constant'
export * from './node'

export const sleep = (ms = 1000) => new Promise(resolve => setTimeout(resolve, ms))

export async function prompt(msg: string) {
  const ans = await consola.prompt(msg) as string

  if (!ans?.trim())
    return await prompt(msg)

  return ans
}

interface Cookie {
  name: string
  value: string
  domain: string
}

export function getCookie(cookie: string | Record<string, string>[]) {
  if (typeof cookie === 'object') {
    const cookies: Record<string, string> = {}
    cookie.forEach(({ name, value }) => {
      cookies[name] = value
    })
    return cookies
  }

  const cookies: Record<string, string> = cookie
    .split(';')
    .map(cookie => cookie.split('=').map(c => c.trim()))
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {})

  return cookies
}

export function getCookieString(cookie: Record<string, string>[]) {
  return cookie
    .map(({ name, value }) => `${name}=${value}`)
    .join('; ')
}

export function cookieToRecord(
  cookie: string,
  url: string,
): Cookie[] {
  const domain = new URL(url).hostname
  return cookie
    .split(';')
    .map(cookie => cookie.split('=').map(c => c.trim()))
    .map(([name, value]) => ({ name, value, domain }))
}

/**
 * Format the date string
 * @param input the date string
 * @param format the format string, e.g. `YYYY-MM-DD HH:mm:ss`
 */
export function formatDate(input: string | number | Date, format: string) {
  const date = new Date(input)
  const pad = (num: number) => num.toString().padStart(2, '0')

  const year = date.getUTCFullYear()
  const month = pad(date.getUTCMonth() + 1) // Months are zero-based
  const day = pad(date.getUTCDate())
  const hours = pad(date.getUTCHours())
  const minutes = pad(date.getUTCMinutes())
  const seconds = pad(date.getUTCSeconds())

  return format
    .replace('YYYY', year.toString())
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds)
}

export const chromePath = (() => {
  if (isWindows)
    return 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'

  if (isMacOS)
    return '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

  return '/usr/bin/google-chrome'
})()
