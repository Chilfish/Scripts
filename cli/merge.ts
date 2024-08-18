import { readJson, writeJson } from '~/utils/file'
import { uniqueObj } from '~/utils/math'

type ObjArr = Record<string, any>[]

const oldData = await readJson('D:/Downloads/old.json') as ObjArr
const newData = await readJson('D:/Downloads/new.json') as ObjArr

const mergedData = uniqueObj(oldData.concat(newData), 'id')
  .sort((a, b) => {
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  })

console.log(mergedData.length, oldData.length, newData.length)

await writeJson('D:/Downloads/merged.json', mergedData)
