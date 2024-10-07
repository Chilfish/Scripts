import { uniqueObj } from '~/utils'
import { readJson, writeJson } from '~/utils/index.node'

// `2023-04-26 18:41:52` to `20230426_184152`
function formatTime(time: string) {
  return time
    .replace(/[-:]/g, '')
    .replace(' ', '_')
}

const filepath = process.argv[2]
if (!filepath) {
  console.error('Please provide a filepath')
  process.exit(1)
}

const data = await readJson<any[]>(filepath)

console.log(data.length)

const imgs = data.flatMap(el => el.media.map((url: any, idx: number) => {
  const isVideo = url.includes('video.twimg.com')

  let suffix = `-${idx + 1}`
  if (el.media.length === 1)
    suffix = ''
  const ext = isVideo ? 'mp4' : 'jpg'

  return {
    name: `${formatTime(el.created_at)}-${el.id}${suffix}.${ext}`,
    url,
  }
}))
  .filter(Boolean)

await writeJson('data/twitter/imgs.json', uniqueObj(imgs, 'url'))
