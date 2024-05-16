import { consola } from 'consola'

export * from './math'
export * from './fetch'

export const sleep = (ms = 1000) => new Promise(resolve => setTimeout(resolve, ms))

export async function prompt(msg: string) {
  const ans = await consola.prompt(msg) as string

  if (!ans?.trim())
    return await prompt(msg)

  return ans
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
