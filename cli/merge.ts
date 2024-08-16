import { readJson, writeJson } from '~/utils/file'

const oldData = await readJson('D:/Downloads/old.json') as object[]
const newData = await readJson('D:/Downloads/new.json') as object[]

function mergeAndDeduplicate(
  oldData: object[],
  newData: object[],
  key: string = 'id',
) {
  const mergedData = oldData.concat(newData)

  const deduplicatedData = mergedData.reduce((acc, item) => {
    const keyVal = item[key]
    if (!acc[keyVal]) {
      acc[keyVal] = item
    }
    return acc
  }, {} as Record<string, object>)

  return Object.values(deduplicatedData)
}

const mergedData = mergeAndDeduplicate(oldData, newData).sort((a, b) => {
  return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
})

console.log(mergedData.length, oldData.length, newData.length)

await writeJson('D:/Downloads/merged.json', mergedData)
