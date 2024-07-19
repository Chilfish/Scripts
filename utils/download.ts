import path from 'node:path'
import { existsSync } from 'node:fs'
import { mkdir, writeFile } from 'node:fs/promises'
import { Buffer } from 'node:buffer'

import { ProxyAgent, RequestInit, fetch } from 'undici'
import { proxyUrl } from './constant'
import { logger } from '~/utils/node'

export const proxy = new ProxyAgent(proxyUrl)
export const proxyFetch = (url: string, options?: RequestInit) => fetch(url, { ...options, dispatcher: proxy })

export interface DownloadOptions {
  url: string
  raw?: boolean
  dest?: string
  name?: string
  mime?: string
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

  if (!name.includes('.'))
    name = `${name}.jpg`

  const filename = path.resolve(`${dest}/${name}`)
  if (existsSync(filename))
    return true

  if (!existsSync(dest))
    await mkdir(dest, { recursive: true })

  try {
    const res = await fetch(url, {
      ...fetchOptions,
      dispatcher: proxy,
    })
    const mimeType = res.headers.get('content-type') || 'image/jpeg'

    if (
      !res.ok
      || !res.body
      || mime && !mimeType.includes(mime)
    ) {
      if (mime)
        logger.warn(`miniType not match: ${mimeType} !== ${mime}`)
      throw new Error('Invalid response, no body or not ok')
    }

    const buffer = await res.arrayBuffer()

    await writeFile(filename, Buffer.from(buffer))

    logger.success(`Downloaded ${url}`)

    return true
  }
  catch (e) {
    logger.error(`Failed to download ${url}，${e}`)
    return false
  }
}
