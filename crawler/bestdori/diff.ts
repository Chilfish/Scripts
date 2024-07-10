/**
 * 查看是否有新数据，有则更新
 */

import path from 'node:path'
import { diff } from 'ohash'
import { getFileDir } from '.'
import { readJson, root, writeJson } from '~/utils/file'

const savePath = path.resolve(root, 'crawler/bestdori/data.json')

const [oldFile, newFile] = await Promise.all([
  readJson(savePath).catch(() => ({})),
  getFileDir(),
])

const theDiff = diff(oldFile, newFile)

if (theDiff.length === 0) {
  console.log('No new data found.')
  process.exit(0)
}

console.log('New data found, updating...')
await writeJson(savePath, newFile)

if (Object.keys(oldFile).length === 0) {
  console.log('Done!')
  process.exit(0)
}

console.log('Diff:')
for (const { newValue } of theDiff) {
  console.log(newValue.key.replace(/\./g, '/'))
}
