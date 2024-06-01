import { mkdir, readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import PQueue from 'p-queue'
import { consola } from 'consola'
import {
  downloadBlob,
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

consola.info(`Start downloading ${imgs.length} to ${dest}`)

const queue = new PQueue({ concurrency: 6 })
let progress = 0
imgs.forEach(({ name, url }) => {
  if (name.endsWith('.png'))
    url = `${url}&name=large`

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
