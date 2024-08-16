import { readJson, writeJson } from '~/utils/index.node'
import { uniqueObj } from '~/utils'

// `2023-04-26 18:41:52` to `20230426_184152`
function formatTime(time: string) {
  return time
    .replace(/[-:]/g, '')
    .replace(' ', '_')
}

interface User {
  name: string // as id
  nickname: string
  avatar: string
}

const removed = [
  'bookmark_count',
  'favorite_count',
  'bookmarked',
  'favorited',
  'retweeted',
  'url',
]

const name = process.argv[2]

/**
 * data.json exported from https://github.com/prinsss/twitter-web-exporter
 */
let data = await readJson('D:/Downloads/merged.json')
  .then((data: any[]) => data.sort((a: any, b: any) => b.id.localeCompare(a.id)))

data = data.map((el) => {
  if (el.full_text.startsWith('RT @')) {
    return null
  }

  removed.forEach((key) => {
    delete el[key]
  })
  el.media = el.media.map((media: any) => {
    let url = media.original
    if (media.type === 'video')
      url = media.original

    return url
  })

  el.full_text = el.full_text
    .replace(/\xA0|\u3000/g, ' ') // 不可见空格

  el.views_count = +el.view_count || 0

  if (el.in_reply_to) {
    const tweet = data.find(tweet => tweet.id === el.in_reply_to)
    if (tweet) {
      el.in_reply_to = {
        id: tweet.id,
        name: tweet.name,
      }
    }
  }

  el.created_at = el.created_at
    .replace(/_/, ' ')
    .replace(/ [+-]\d+/, '')

  return el
})
  .filter(Boolean)
  .sort((a, b) => a.created_at.localeCompare(b.created_at))

if (name)
  data = data.filter(el => el.name === name)

const textData = data.map((el) => {
  if (el.retweeted_status)
    return null

  return {
    text: el.full_text.replace(/ https:\/\/t\.co\/.{10}\n?/, ''),
    id: el.id,
    time: el.created_at,
  }
})
  .filter(Boolean)

const imgs = data.flatMap(el => el.media.map((url: any, idx: number) => {
  const isVideo = url.includes('video.twimg.com')
  if (isVideo)
    return null

  let suffix = `-${idx + 1}`
  if (el.media.length === 1)
    suffix = ''
  const ext = isVideo ? 'mp4' : 'jpg'

  return {
    name: `${el.screen_name}-${formatTime(el.created_at)}-${el.id}${suffix}.${ext}`,
    url,
  }
}))
  .filter(Boolean)

const saveImg = writeJson('data/twitter/imgs.json', uniqueObj(imgs, 'url'))

const user = {
  name: data[0].screen_name,
  nickname: data[0].name,
  avatar: data[0].profile_image_url,
} as User

data.forEach((el) => {
  delete el.screen_name
  delete el.name
  delete el.profile_image_url
})

const saveTweets = writeJson('data/twitter/data-after.json', {
  user,
  tweets: data,
})

const saveText = writeJson('data/twitter/text.json', textData)

await Promise.all([saveImg, saveTweets, saveText])

console.log(`Done! ${data.length} tweets saved. ${imgs.length} images saved.`)
