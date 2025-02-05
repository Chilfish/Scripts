import { utimes } from 'node:fs/promises'
import path from 'node:path'
import glob from 'fast-glob'

const folder = process.argv[2]

if (!folder) {
  console.error('Folder is required')
  process.exit(1)
}

const mediaFiles = await glob(`${path.join(folder).replaceAll('\\', '/')}/*`)
// rewrite created time

for (const file of mediaFiles) {
  // 20200426_195259-xxx.jpg
  const createdAt = file.split('/').pop()?.split('-')[0]

  if (!createdAt || !createdAt.match(/^\d+/))
    continue

  const date = new Date(
    Number.parseInt(createdAt.substring(0, 4)), // year
    Number.parseInt(createdAt.substring(4, 6)) - 1, // month (0-based)
    Number.parseInt(createdAt.substring(6, 8)), // day
    Number.parseInt(createdAt.substring(9, 11)), // hours
    Number.parseInt(createdAt.substring(11, 13)), // minutes
    Number.parseInt(createdAt.substring(13, 15)), // seconds
  )

  if (Number.isNaN(date.getTime())) {
    console.error(`Invalid date ${createdAt}, ${file}`)
    continue
  }

  await utimes(file, date, date)
    .catch(err => console.error(`Failed to rewrite created time ${err}`))
}

console.log('Done', mediaFiles.length)
