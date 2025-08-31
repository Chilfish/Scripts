import { writeJson, readJson } from '~/utils/nodejs'
import { glob } from 'fast-glob'
import data from '../../data/bili/azusakun_infty-1744020715639/1-1032987106976202759.json'

const files = await glob('data/bili/azusakun_infty-*/*.json', {
  absolute: true,
})

console.log(files)

const merged = new Map<string, (typeof data)[0]>()

for (const file of files) {
  const fileData: typeof data = await readJson(file)

  fileData.forEach((item) => {
    if (!merged.get(item.id_str)) {
      merged.set(item.id_str, item)
    }
  })
}

const result = Array.from(merged.values()).sort((a, b) => {
  return Number(a.id_str) - Number(b.id_str)
})

await writeJson('data/bili/azusakun_infty.json', result)
