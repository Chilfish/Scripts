import { uniqueObj } from '~/utils'
import { readJson, writeJson } from '~/utils/file'

const folder = 'D:/Codes/static/tweet/data-imgs.json'

const data = await readJson(folder) as any[]

const uniqueData = uniqueObj(data, 'statusId').sort((a, b) => a.statusId.localeCompare(b.statusId))

console.log(uniqueData.length, data.length)

await writeJson(folder.replace('.json', '-unique.json'), uniqueData)
