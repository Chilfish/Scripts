import { readFile } from 'node:fs/promises'
import path from 'node:path'
import PQueue from 'p-queue'
import { dir, downloadBlob } from '~/utils/index.node'

const fileList = process.argv[2] || 'D:/Downloads/files.json'
const dest = dir(process.argv[3] || 'D:/Downloads/tmp')

const data = await readFile(path.resolve(fileList), 'utf-8').then((data) => {
  const urls = data.split('\r\n')
  return urls.map((url, idx) => ({
    url,
    name: url.split('/').pop() || `img-${idx}.jpg`,
  }))
})

console.log('Total files:', data.length)

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
