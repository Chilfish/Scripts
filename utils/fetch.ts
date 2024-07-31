import { ofetch } from 'ofetch'
import { getCookieString } from './cookie'
import { newBrowser } from './puppeteer'

// from: https://github.com/DIYgod/RSSHub/blob/d21c4dd/lib/routes/bilibili/cache.ts#L16-L31
export async function getBiliAnonToken() {
  const browser = await newBrowser()
  const page = await browser.newPage()
  await page.goto('https://space.bilibili.com/1/dynamic')

  const cookieString = await new Promise<string>((res) => {
    page.on('requestfinished', async (req) => {
      if (req.url() === 'https://api.bilibili.com/x/internal/gaia-gateway/ExClimbWuzhi') {
        const cookies = await page.cookies()
        res(getCookieString(cookies))
      }
    })
  })

  await browser.close()
  return cookieString
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

export function checkNetwork(domain = 'x.com') {
  return new Promise<string>((res) => {
    fetch(`https://${domain}`)
      .then(_ => res('ok'))
      .catch(err => res(
        `${err.cause}`.replace('Error: ', 'NetworkError: '),
      ))
  })
}
