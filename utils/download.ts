import { createWriteStream, existsSync } from 'node:fs'
import { utimes } from 'node:fs/promises'
import path from 'node:path'
import { pipeline } from 'node:stream'
import { promisify } from 'node:util'
import { consola } from 'consola'
import { fetch, ProxyAgent, RequestInit } from 'undici'
import { proxyUrl } from './constant'
import { dir } from './file'

export const proxy = new ProxyAgent(proxyUrl)
export function proxyFetch(url: string, options?: RequestInit) {
  return fetch(url, {
    ...options,
    dispatcher: proxy,
  })
}

const streamPipeline = promisify(pipeline)

export interface DownloadOptions {
  url: string
  raw?: boolean
  dest?: string
  name?: string
  mime?: string
  followRedirect?: boolean
  fetchOptions?: RequestInit
}
export async function downloadBlob(options: DownloadOptions): Promise<boolean> {
  const {
    url,
    mime,
    dest = 'D:/Downloads',
    followRedirect = true,
    fetchOptions,
  } = options
  let { name } = options

  if (!url)
    throw new Error('URL is required')

  name = name?.trim() || new URL(url).pathname.split('/').pop() || 'unknown_file'
  let filename = dir(`${dest}/${name}`)

  if (existsSync(filename)) {
    return true
  }

  try {
    const res = await proxyFetch(url, fetchOptions)
    const mimeType = res.headers.get('content-type')

    if (!res.ok || !res.body) {
      throw new Error(`Invalid response: ${res.status} ${res.statusText}`)
    }

    if (mime && mimeType && !mimeType.includes(mime)) {
      consola.warn(`MIME type mismatch: expected ${mime}, got ${mimeType}`)
      throw new Error('MIME type mismatch')
    }

    // set file name to the original file's name
    if (followRedirect && !options.name) {
      const redirectedFilename = res.url.split('/').pop()
      if (redirectedFilename) {
        filename = path.resolve(dest, redirectedFilename)
      }
    }

    await streamPipeline(res.body, createWriteStream(filename))

    // set file created time to the original file's created time
    const createdAt = new Date(res.headers.get('last-modified') || Date.now())
    await utimes(filename, createdAt, createdAt)

    consola.success(`Downloaded ${res.url} to ${filename}`)
    return true
  }
  catch (error) {
    consola.error(`Failed to download ${url}:`, error)
    return false
  }
}
