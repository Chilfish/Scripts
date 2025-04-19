import { writeFile } from 'node:fs/promises'
import path from 'node:path'
import { glob } from 'fast-glob'
import data from '../data/medias.json'
import { writeJson } from '../utils/nodejs'

const dir = 'F:/Pictures/seiyu/nishio'

const files = await glob(`${dir}/**`, {
  onlyFiles: false,
})
  .then(files => files.map(
    file => path
      .relative(dir, file)
      .replaceAll('\\', '/'),
  ),
  )

const grouped = new Map<string, string[]>()

files.forEach((file) => {
  let [dir, filename] = file.split('/')

  if (!filename) {
    filename = dir
    dir = '未分类'
  }

  if (!grouped.get(dir)) {
    grouped.set(dir, [])
  }

  grouped.get(dir)!.push(filename)
})

await writeJson('data/files.json', grouped)

for (const [dir, filenames] of grouped) {
  const filtered = data
    .filter(item => filenames.find(filename => filename === item.name),
    )
    .map(({ url }) => url)
    .join('\n')

  if (filtered)
    await writeFile(`data/tmp/下载链接-${dir}.txt`, filtered)
}
