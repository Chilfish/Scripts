import { createWriteStream, existsSync } from 'node:fs'
import { utimes } from 'node:fs/promises'
import path from 'node:path'
import { pipeline } from 'node:stream'
import { promisify } from 'node:util'
import { consola } from 'consola'
import { fetch, ProxyAgent, RequestInit } from 'undici'
import { proxyUrl } from '../constant'
import { murmurHashV3, toBase62 } from '../math'
import { PQueue, PQueueOptions } from '../promise'
import { dir, sanitizeFilename } from './file'
import { updateProgress } from './progress'

export const proxy = new ProxyAgent(proxyUrl)
export function proxyFetch(url: string, options?: RequestInit) {
  return fetch(url, {
    ...options,
    dispatcher: proxy,
  })
}

const streamPipeline = promisify(pipeline)

export interface DownloadFileInfo {
  url: string
  name?: string
}

export interface DownloadOptions {
  raw?: boolean
  dest?: string
  mime?: string
  proxy?: boolean
  followRedirect?: boolean
  fetchOptions?: RequestInit
  hash?: boolean
}

const defaultOptions = {
  dest: 'D:/Downloads',
  followRedirect: true,
}

export async function downloadBlob(
  options: (DownloadOptions & DownloadFileInfo) | string,
): Promise<boolean> {
  const { url, ...optionsRest } = typeof options === 'string' ? { url: options } : options

  const {
    mime,
    dest,
    followRedirect,
    fetchOptions,
    proxy,
    hash,
  } = { ...defaultOptions, ...optionsRest }

  if (!url)
    throw new Error('URL is required')

  const name = sanitizeFilename(
    optionsRest.name
    || new URL(url).pathname.split('/').pop()
    || 'unknown_file',
  )
  let filename = dir(`${dest}/${name}`)

  if (existsSync(filename) && !hash) {
    return true
  }
  const fetcher = proxy ? proxyFetch : fetch

  try {
    const res = await fetcher(url, fetchOptions)
    const mimeType = res.headers.get('content-type')

    if (!res.ok || !res.body) {
      throw new Error(`Invalid response: ${res.status} ${res.statusText}`)
    }

    if (mime && mimeType && !mimeType.includes(mime)) {
      throw new Error(`MIME type mismatch: expected ${mime}, got ${mimeType}`)
    }

    // set file name to the original file's name
    if (followRedirect && !optionsRest.name) {
      const redirectedFilename = new URL(res.url).pathname.split('/').pop()
      if (redirectedFilename) {
        filename = path.resolve(dest, sanitizeFilename(redirectedFilename))
      }
    }

    const ext = path.extname(filename)
    const base = path.basename(filename, ext)
    if (hash) {
      const hash = toBase62(murmurHashV3(res.url))
      filename = path.resolve(dest, `${base}-${hash}${ext}`)
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

export async function downloadFiles(
  files: DownloadFileInfo[] | string[],
  options?: DownloadOptions & Partial<PQueueOptions> & {
    progress?: boolean
  },
) {
  options = {
    concurrency: 10,
    progress: true,
    ...defaultOptions,
    ...options,
  }

  console.log('downloadFiles', options)

  let downloaded = 0
  const queue = new PQueue(options)
  const fileArr = files.map(file => typeof file === 'string' ? { url: file } : file)

  for (const file of fileArr) {
    queue.add(async () => {
      const res = await downloadBlob({
        ...options,
        ...file,
      })
      if (res) {
        downloaded++
        updateProgress({
          current: downloaded,
          total: fileArr.length,
        })
      }
    })
  }

  await queue.onIdle()

  return downloaded
}
