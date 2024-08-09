import * as qs from 'neoqs'
import { isJsonStr } from '.'

export function parseObjectQs<T extends Record<string, any>>(query: string) {
  return qs.parse(query, {
    decoder: (str, defaultDecoder, charset, type) => {
      if (type === 'value' && isJsonStr(str)) {
        return JSON.parse(decodeURIComponent(str))
      }
      return defaultDecoder(str, defaultDecoder, charset)
    },
  }) as T
}

export function stringifyObjectQs<T extends Record<string, any>>(object: T) {
  return Object.entries(object).map(([key, value]) => {
    if (typeof value === 'object') {
      return `${key}=${encodeURIComponent(JSON.stringify(value))}`
    }
    return `${key}=${encodeURIComponent(value)}`
  }).join('&')
}

export function buildUrl({ uri, query, hash }: {
  uri: string
  query: Partial<Record<string, any>>
  hash?: string
}) {
  const url = new URL(uri)
  const search = stringifyObjectQs(query)
  url.search = search
  if (hash) {
    url.hash = hash
  }
  return url.href
}
