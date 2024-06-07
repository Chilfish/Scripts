import path from 'node:path'
import { existsSync } from 'node:fs'
import { writeFile } from 'node:fs/promises'
import { Buffer } from 'node:buffer'
import { ofetch } from 'ofetch'

import { logger } from '../utils'

export interface DownloadOptions {
  url: string
  dest?: string
  name?: string
  fetchOptions?: RequestInit
}

export async function downloadBlob(
  options: DownloadOptions,
) {
  let {
    url,
    name,
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

  try {
    const res = await fetch(url, fetchOptions)
      .then(res => res.arrayBuffer())

    await writeFile(filename, Buffer.from(res))

    logger(`Downloaded ${name}`, 'success')

    return true
  }
  catch (e) {
    logger(`Failed to download ${name}`, 'error')
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
