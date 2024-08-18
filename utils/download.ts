import path from 'node:path'
import { createWriteStream, existsSync } from 'node:fs'
import { pipeline } from 'node:stream'
import { promisify } from 'node:util'
import { utimes } from 'node:fs/promises'
import { ProxyAgent, RequestInit, fetch } from 'undici'
import { consola } from 'consola'
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

export async function downloadBlob(
  options: DownloadOptions,
) {
  let {
    url,
    raw,
    name,
    mime,
    dest = 'D:/Downloads',
    followRedirect = true,
    fetchOptions,
  } = options

  if (!url)
    throw new Error('url is required')

  if (!raw) {
    url = url.replace('-scaled', '') // -scaled
      .replace(/-\d+x\d+/, '') // remove size suffix: -300x300
      .replace(/-\d+px/, '') // remove size suffix: -300px
  }

  if (!name?.trim())
    name = new URL(url).pathname.split('/').pop() || 'image.jpg'

  let filename = dir(`${dest}/${name}`)
  if (existsSync(filename) && !followRedirect)
    return true

  try {
    const res = await proxyFetch(url, fetchOptions)

    const mimeType = res.headers.get('content-type') || 'image/jpeg'
    if (
      !res.ok
      || !res.body
      || mime && !mimeType.includes(mime)
    ) {
      if (mime)
        consola.warn(`miniType not match: ${mimeType} !== ${mime}`)
      throw new Error('Invalid response, no body or not ok')
    }

    // 有时服务器会将发起的链接重定向到实际的文件链接，导致原url丢失文件名信息
    if (followRedirect && !options.name)
      filename = path.resolve(`${dest}/${res.url.split('/').pop() || name}`)

    // 设置文件创建时间为服务器返回的时间
    const createdAt = new Date(res.headers.get('last-modified') || Date.now())

    await streamPipeline(res.body, createWriteStream(filename))

    await utimes(filename, createdAt, createdAt)

    consola.success(`Downloaded ${res.url}`)

    return true
  }
  catch (e) {
    consola.error(`Failed to download ${url}, ${e}`)
    return false
  }
}
