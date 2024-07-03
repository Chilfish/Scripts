import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { root } from '~/utils/node'
import { uniqueObj } from '~/utils'

// `2023-04-26 18:41:52` to `20230426_184152`
function formatTime(time: string) {
  return time.replace(/[-:]/g, '').replace(' ', '_')
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

if (!name) {
  console.error('Please provide a name')
  process.exit(1)
}

/**
 * data.json exported from https://github.com/prinsss/twitter-web-exporter
 */
let data = await readFile(path.join(root, 'data.json'), 'utf-8')
  .then(JSON.parse)
  .then((data: any[]) => data.sort((a: any, b: any) => b.id.localeCompare(a.id)))

data = data
  .map((el) => {
    removed.forEach((key) => {
      delete el[key]
    })
    el.media = el.media.map((media: any) => {
      let url = media.original.replace(/(jpg|png)&name=orig/, 'png')
      if (media.type === 'video')
        url = media.original

      return url
    })

    el.full_text = el.full_text
      .replace(/\xA0/g, ' ') // 不可见空格

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

    el.created_at = el.created_at.replace(/_/, ' ')

    return el
  })
  .filter(el => el.name === name)

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

  let suffix = `-${idx + 1}`
  if (el.media.length === 1)
    suffix = ''

  return {
    name: `${formatTime(el.created_at)}-${el.id}${suffix}.${isVideo ? 'mp4' : 'png'}`,
    url,
  }
}))
  .filter(Boolean)

const saveImg = writeFile(
  path.join(root, 'imgs.json'),
  JSON.stringify(
    uniqueObj(imgs, 'url'),
    null,
    2,
  ),
)

const saveTweets = writeFile(
  path.join(root, 'data-after.json'),
  JSON.stringify({
    user,
    tweets: data,
  }, null, 2),
)

const saveText = writeFile(
  path.join(root, 'text.json'),
  JSON.stringify(textData, null, 2),
)

await Promise.all([saveImg, saveTweets, saveText])

console.log(`Done! ${data.length} tweets saved.`)
