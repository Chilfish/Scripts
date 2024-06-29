export * from './math'
export * from './constant'
export * from './cookie'
export * from './date'
export * from './fetch'

export function buildSearchParam(obj: Record<string, string>) {
  return Object.keys(obj)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(obj[key])}`)
    .join('&')
}
