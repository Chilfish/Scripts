export * from './constant'
export * from './cookie'
export * from './date'
export * from './dom'
export * from './fetch'
export * from './math'
export * from './promise'
export * from './url'

export function isJsonStr(str: string) {
  const start = ['{', '[', '%7B', '%5B']
  const end = ['}', ']', '%7D', '%5D']

  const startChar = str[0]
  const endChar = str[str.length - 1]

  return start.includes(startChar) && end.includes(endChar)
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
