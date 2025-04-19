import { ofetch } from 'ofetch'

ofetch('https://login.sina.com.cn/sso/login.php', {
  headers: {
    cookie: `
SCF=AmnYVrHiyXNLg-FmuKZTTVUIu4Ng1vPs8QMhR5w3Z6Mtlw4_18SxdEFqAddhcyMUCcm6UvlyjLnIdxCZ0LfgH88;tgc=TGT-NzY3OTA2NTYyOA==-1744639699-wq-3FEBE6316F027962D07FDE1A34ED7423-1;`,
  },
  onResponse({ response }) {
    console.log(response.headers.getSetCookie())
  },
  redirect: 'manual',
})
