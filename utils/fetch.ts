import { ofetch } from 'ofetch'

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
