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
