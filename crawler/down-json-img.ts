import path from 'node:path'
import fs from 'node:fs'
import PQueue from 'p-queue'
import { downloadBlob, readJson } from '~/utils/node'

const file = process.argv[2]
if (!file) {
  console.error('Usage: down-json-img.ts <json-file> [dest]')
  process.exit(1)
}

const dest = process.argv[3] || 'D:/Downloads/imgs'
if (!fs.existsSync(dest)) {
  fs.mkdirSync(dest, { recursive: true })
}

const data = await readJson(path.resolve(file)).then(parseImgs)

console.log('Total images:', data.length)

const queue = new PQueue({ concurrency: 10 })

for (const { url, name } of data) {
  queue.add(() => downloadBlob({
    url,
    name,
    dest: path.resolve(dest),
  }))
}

await queue.onIdle()
console.log('All images downloaded')

interface ImgData {
  url: string
  name: string
}

/**
 * Parse images from JSON data
 */
function parseImgs(data: any): ImgData[] {
  const { tweets } = data

  return tweets.map((tweet: any) => {
    const name = tweet.created_at.split(' ').join('_').replace(/:/g, '-')
    return tweet.images.map((img: string, idx: number) => ({
      url: img,
      name: `${name}_${tweet.id}_${idx}.jpg`,
    }))
  })
    .flat()
}
