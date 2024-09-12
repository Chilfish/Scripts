import { readFile } from 'node:fs/promises'
import path from 'node:path'
import PQueue from 'p-queue'
import { dir, downloadBlob } from '~/utils/index.node'

const file = process.argv[2]
if (!file) {
  console.error('Usage: down-json-img.ts <json-file> [dest]')
  process.exit(1)
}

const dest = dir(process.argv[3] || 'D:/Downloads/imgs')

const data = await readFile(path.resolve(file), 'utf-8').then((data) => {
  const urls = data.split('\r\n')
  return urls.map((url, idx) => ({
    url,
    name: url.split('/').pop() || `img-${idx}.jpg`,
  }))
})

// const data = await readJson(path.resolve(file)).then(parseImgs)

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
