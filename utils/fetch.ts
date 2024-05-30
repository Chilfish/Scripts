import { writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { Buffer } from 'node:buffer'
import { ofetch } from 'ofetch'
import { logger, runCommand } from '../utils'

export async function downloadImage(
  _url: string,
  name = '',
  cookie = '',
  dest = 'D:/downloads',
) {
  const url = _url.replace('-scaled', '') // -scaled
    .replace(/-\d+x\d+/, '') // remove size suffix: -300x300
    .replace(/-\d+px/, '') // remove size suffix: -300px

  if (!name.trim())
    name = new URL(url).pathname.split('/').pop() || 'image.jpg'

  if (!name.includes('.'))
    name = `${name}.jpg`

  const filename = path.resolve(`${dest}/${name}`)
  if (existsSync(filename))
    return true

  try {
    const res = await fetch(url, {
      headers: {
        cookie,
      },
    })
    if (!res.ok)
      throw new Error(`HTTP ${res.status}`)

    if (!res.headers.get('content-type')?.startsWith('image'))
      throw new Error('Not an image')

    const buffer = await res.arrayBuffer()
    await writeFile(filename, Buffer.from(buffer))

    logger(`成功：${filename}`, 'success')
    return true
  }
  catch (e) {
    logger(`失败：${url}, ${e}`, 'error')
    return false
  }
}
export async function downloadvideo(
  url: string,
  name = '',
  dest = 'D:/downloads',
) {
  if (!name.trim())
    name = url.split('/').pop() || 'video.mp4'

  if (!name.includes('.'))
    name = `${name}.mp4`

  const filename = path.resolve(`${dest}/${name}`)

  if (existsSync(filename))
    return true

  return await runCommand(`yt-dlp --cookies-from-browser chrome "${url}" -o "${filename}"`)
    .then(() => {
      logger(`成功：${filename}`, 'success')
      return true
    })
    .catch((err: any) => {
      logger(`失败：${url}, ${err}`, 'error')
      return false
    })
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
