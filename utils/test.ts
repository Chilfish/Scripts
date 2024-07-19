import { downloadBlob } from './download'
import { readCookie } from './config'

const url = 'https://api.bilibili.com/x/vas/dlc_act/asset_bag?act_id=102857&csrf=f16035a8661780a1ac5577af276b2f39&lottery_id=0&ruid=0'
const cookie = await readCookie('bilibili')

const { data } = await fetch(url).then(res => res.json())

for (const { card_item } of data.item_list) {
  const videoUrl = card_item?.video_list?.[0]
  if (!videoUrl)
    continue
  const name = card_item.card_name

  console.log(`Downloading ${name}...`)
  await downloadBlob({
    url: videoUrl,
    name: `${name}.mp4`,
    fetchOptions: {
      headers: {
        cookie,
      },
    },
  })
}
