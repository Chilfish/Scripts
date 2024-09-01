import { CronJob } from 'cron'
import { randomUserAgent } from '~/utils'
import { readCookie } from '~/utils/config'
import { createLogger } from '~/utils/logger'

const cookie = readCookie('weibo')
const logger = createLogger('weibo-checkin')

async function checkin() {
  const ids = {
    '立石凛': '100808040f58aa39cc8a90db641ef491dcf781',
    '青木阳菜': '100808cb47599556df027eeef41deac5538a1f',
    'MyGO': '100808961d61b1b844cc4680726631cc5fef1e',
    'BanG Dream': '1008086e7266ed409c40670fae5161c97898a2',
    // 'ChiliChill': '100808436da0f67005601814558f34536d8807'
  } as const

  const api = 'https://weibo.com/p/aj/general/button?api=http://i.huati.weibo.com/aj/super/checkin&id='

  const ua = randomUserAgent()
  async function run(id: string) {
    return await fetch(api + id, {
      headers: {
        cookie,
        'user-agent': ua,
      },
    })
      .then(res => res.json())
      .then(data => ({ msg: data.data.alert_title || data.msg }))
      .catch(err => ({ msg: err.message }))
  }

  await Promise.all(
    Object.entries(ids).map(async ([name, id]) => {
      const msg = await run(id)

      logger.info(`${name}: ${msg.msg}`)
    }),
  )

  logger.info('超话签到完成')
}

// every day at 00:00
const every24time = '0 0 0 * * *'
const job = CronJob.from({
  cronTime: every24time,
  onTick: checkin,
  start: true,
  runOnInit: true,
  timeZone: 'Asia/Shanghai',
})

job.start()
