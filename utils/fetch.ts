import path from 'node:path'
import { existsSync } from 'node:fs'
import { mkdir, writeFile } from 'node:fs/promises'
import { Buffer } from 'node:buffer'
import { ofetch } from 'ofetch'

import { logger } from '../utils'

export interface DownloadOptions {
  url: string
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
    name,
    mime,
    dest = 'D:/Downloads',
    fetchOptions,
  } = options

  url = url.replace('-scaled', '') // -scaled
    .replace(/-\d+x\d+/, '') // remove size suffix: -300x300
    .replace(/-\d+px/, '') // remove size suffix: -300px

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
    const res = await fetch(url, fetchOptions)
    const mimeType = res.headers.get('content-type') || 'image/jpeg'

    if (
      !res.ok
      || !res.body
      || mime && !mimeType.includes(mime)
    ) {
      if (mime)
        logger(`miniType not match: ${mimeType} !== ${mime}`, 'warn')
      throw new Error(`Failed to download ${url}`)
    }

    const buffer = await res.arrayBuffer()
    await writeFile(filename, Buffer.from(buffer))

    logger(`Downloaded ${name}`, 'success')

    return true
  }
  catch (e) {
    logger(`Failed to download ${url}`, 'error')
    return false
  }
}

export async function getWeiboAnonToken() {
  let token = ''
  const formData = new FormData()
  formData.append('cb', 'visitor_gray_callback')

  await ofetch('https://passport.weibo.com/visitor/genvisitor2', {
    method: 'POST',
    body: formData,
    onResponse({ response }) {
      const cookie = response?.headers.getSetCookie() || []
      token = cookie.map(c => c.split(';')[0]).join('; ')
    },
  })

  return token
}
