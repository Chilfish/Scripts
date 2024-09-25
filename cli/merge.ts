import glob from 'fast-glob'
import { readJson, writeJson } from '~/utils/file'
import { uniqueObj } from '~/utils/math'

type ObjArr = Record<string, any>[]

const folder = 'D:/Downloads/西尾夕香'

const jsons = await glob(`${folder}/*.json`)

const data: ObjArr = []

for (const json of jsons) {
  const _data = await readJson<ObjArr>(json)
  data.push(..._data)
}

const mergedData = uniqueObj(data, 'id')
  .sort((a, b) => {
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  })

console.log(mergedData.length, data.length)

await writeJson(`${folder}/merged.json`, mergedData)
