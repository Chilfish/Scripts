/**
 * Download images from Twitter，imgs.json：
 * [
 *  { name: '1.png', url: 'https://pbs.twimg.com/media/1.png' },
 * ]
 */

import path from 'node:path'
import PQueue from 'p-queue'
import { consola } from 'consola'
import {
  downloadBlob,
  readJson,
  updateProgress,
} from '~/utils/node'

const name = process.argv[2]
if (!name) {
  consola.error('Please provide a name')
  process.exit(1)
}

const imgs = await readJson<{ name: string, url: string }[]>('data/imgs.json')

const dest = path.resolve('D:/Downloads', name)

consola.info(`Start downloading ${imgs.length} to ${dest}`)

const queue = new PQueue({ concurrency: 6 })
let progress = 0
imgs.forEach(({ name, url }) => {
  queue.add(async () => {
    await downloadBlob({ url, name, dest })

    updateProgress({
      current: ++progress,
      total: imgs.length,
      otherText: `Downloading ${url}...`,
    })
  })
})

await queue.onIdle()

consola.success('Downloaded all images/videos!')
