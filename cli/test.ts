import glob from 'fast-glob'
import { hash } from 'ohash'
import { dir, readJson, writeJson } from '~/utils/file'

const folder = dir('D:/Codes/static/tweet')

type Key = `data-${string}`
interface Version {
  [key: Key]: string
}

const versions = await readJson<Version>(`${folder}/versions.json`)
  .catch(() => ({} as Version))

const files = await glob(`${folder}/data-*.json`)

for (const file of files) {
  console.log(`Hashing ${file}`)
  const filename = file.split('/').pop()?.split('.').shift()

  const data = await readJson(file)
  const key = `${filename}` as Key

  if (versions[key] === undefined) {
    versions[key] = hash(data)
  }
}

await writeJson(`${folder}/versions.json`, versions)
