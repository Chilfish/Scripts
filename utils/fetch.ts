import { ofetch } from 'ofetch'

function dec2HexUpper(e: number) {
  return Math.ceil(e).toString(16).toUpperCase()
}
function padStringWithZeros(string: string, length: number) {
  let padding = ''
  if (string.length < length) {
    for (let n = 0; n < length - string.length; n++) {
      padding += '0'
    }
  }
  return padding + string
}
function randomHexStr(length: number) {
  let string = ''
  for (let r = 0; r < length; r++) {
    string += dec2HexUpper(16 * Math.random())
  }
  return padStringWithZeros(string, length)
}

function lsid() {
  const e = Date.now().toString(16).toUpperCase()
  const lsid = `${randomHexStr(8)}_${e}`
  return lsid
}

// copy from: https://github.com/DIYgod/RSSHub/blob/81a5807b/lib/routes/bilibili/cache.ts#L27-L46
export async function getBiliAnonToken() {
  const { newBrowser } = await import('./nodejs/puppeteer')
  const browser = await newBrowser()
  const page = await browser.newPage()
  const waitForRequest = new Promise<string>((resolve) => {
    page.on('requestfinished', async (request) => {
      if (request.url() === 'https://api.bilibili.com/x/internal/gaia-gateway/ExClimbWuzhi') {
        const cookies = await page.cookies()
        let cookieString = cookies.map(cookie => `${cookie.name}=${cookie.value}`).join('; ')

        cookieString = cookieString.replace(/b_lsid=[0-9A-F]+_[0-9A-F]+/, `b_lsid=${lsid()}`)
        resolve(cookieString)
      }
    })
  })
  await page.goto('https://space.bilibili.com/1/dynamic')
  const cookieString = await waitForRequest
  // console.log(`Got bilibili cookie: ${cookieString}`)
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
      .catch(err => res(`${err.cause}`))
  })
}
