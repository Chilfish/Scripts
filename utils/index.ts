export * from './math'
export * from './constant'
export * from './cookie'
export * from './date'
export * from './fetch'

export function buildUrl({ uri, query }: {
  uri: string
  query: Partial<Record<string, string | number | null>>
}) {
  const url = new URL(uri)
  for (const [key, value] of Object.entries(query)) {
    if (value !== null && value !== undefined) {
      url.searchParams.set(key, `${value}`)
    }
  }
  return url.href
}

/**
 * 使用 setTimeout 实现 setInterval
 */
export function setInterval_(callback: () => any, interval: number) {
  let timerId: number | null = null

  callback()
  const start = async () => {
    timerId = setTimeout(async () => {
      await callback()
      start()
    }, interval) as any
  }

  start()

  return {
    clear: () => {
      if (timerId !== null) {
        clearTimeout(timerId)
      }
    },
  }
}
