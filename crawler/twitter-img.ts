import { mkdir, readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import PQueue from 'p-queue'
import { consola } from 'consola'
import {
  downloadImage,
  downloadvideo,
  root,
  updateProgress,
} from '../utils'

const name = process.argv[2]
if (!name) {
  consola.error('Please provide a name')
  process.exit(1)
}

const imgs = await readFile(path.join(root, 'imgs.json'), 'utf-8')
  .then(JSON.parse) as { name: string, url: string }[]

const dest = path.resolve('D:/Downloads', name)
if (!existsSync(dest))
  await mkdir(dest, { recursive: true })

const queue = new PQueue({ concurrency: 8 })
let progress = 0
imgs.forEach(({ name, url }) => {
  const isVideo = url.includes('video.twimg.com')

  queue.add(async () => {
    isVideo
      ? await downloadvideo(url, name, dest)
      : await downloadImage(`${url}&name=large`, name, undefined, dest)

    updateProgress(++progress, imgs.length, `Downloading ${url}`)
  })
})

await queue.onIdle()

consola.success('Downloaded all images/videos!')
