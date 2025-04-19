import { cachedData, config } from '../utils/nodejs'

const checkInApi = 'https://weibo.com/p/aj/general/button?api=http://i.huati.weibo.com/aj/super/checkin&id='
const getListApi = 'https://weibo.com/ajax/profile/topicContent?tabid=231093_-_chaohua'

const weiboCookie = process.env.WEIBO_COOKIE || config.cookie.weibo
const force = process.argv.includes('--force')
if (!weiboCookie) {
  console.error('未设置 WEIBO_COOKIE')
  process.exit(1)
}

interface Super {
  id: string
  name: string
}

const ids: Super[] = await cachedData(
  'data/weibo-super-ids.json',
  async () => {
    const res = await fetch(getListApi, {
      headers: {
        cookie: weiboCookie,
      },
    })
    const data = await res.json()
    return data.data.list.map((card: any) => {
      if (!card.oid)
        return null

      const name = card.title
      const id = card.oid.split(':')[1]
      return { name, id }
    })
      .filter(Boolean)
  },
  force,
)

async function weiboSuper() {
  await Promise.all(
    ids.map(async ({ name, id }) => {
      const msg = await fetch(checkInApi + id, {
        headers: {
          cookie: weiboCookie,
        },
      })
        .then(res => res.json())
        .then(data => data.data.alert_title || data.msg)
        .catch((err) => {
          console.error(err)
          process.exit(1)
          return err
        })

      console.log(`${name}: ${msg}`)
    }),
  )

  console.log('超话签到完成')
}

weiboSuper()
