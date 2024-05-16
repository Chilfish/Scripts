import { writeFile } from 'node:fs/promises'
import { Buffer } from 'node:buffer'
import { ofetch } from 'ofetch'

export async function downloadImage(
  _url: string,
  cookie = '',
) {
  const url = _url.replace('-scaled', '') // -scaled
    .replace(/-\d+x\d+/, '') // remove size suffix: -300x300
    .replace(/-\d+px/, '') // remove size suffix: -300px
    .replace(/[?@].+/, '') // remove query string

  console.log(`downloading ${url}`)

  let name = url.split('/').pop() || 'image.jpg'
  if (!name.includes('.'))
    name = `${name}.jpg`

  try {
    const res = await fetch(url, {
      headers: {
        cookie,
      },
    })
    if (!res.headers.get('content-type')?.startsWith('image'))
      throw new Error('Not an image')

    const buffer = await res.arrayBuffer()
    await writeFile(`D:/downloads/${name}`, Buffer.from(buffer))
    return true
  }
  catch (e) {
    console.error(`失败：${url}, ${e}`)
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
