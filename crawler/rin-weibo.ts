import { consola } from 'consola'
import { ofetch } from 'ofetch'

async function fetchInfo() {
  const api = 'https://m.weibo.cn/api/container/getIndex?containerid=100808040f58aa39cc8a90db641ef491dcf781_-_live'

  const data = await ofetch(api).then(res => res.data.cards[0].card_group.at(-1))

  return {
    name: data.user.screen_name,
    activity: data.desc1,
  }
}

const { name, activity } = await fetchInfo()

consola.info(`[Weibo] ${name} ${activity}`)
