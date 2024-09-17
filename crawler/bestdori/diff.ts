/**
 * 查看是否有新数据，有则更新
 */

import { diff } from 'ohash'
import { formatDate, now } from '~/utils'
import { dir, readJson, writeJson } from '~/utils/file'
import { explorerUrl, getFileDir } from '.'

const savePath = dir('data/bestdori/dir.json')

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

const newData: string[] = []
for (const { newValue } of theDiff) {
  const key = newValue.key.replace(/\./g, '/')
  newData.push(`${explorerUrl}/${key}`)
}

await writeJson(
  `data/bestdori/bestdori-diff-${formatDate(now(), 'MM-DD')}.json`,
  newData,
)

console.log('Diff:', newData.length)
