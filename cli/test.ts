import { readJson, writeJson } from '~/utils/file'
import { uniqueObj } from '~/utils'

interface History {
  // title, url, time
  rows: [string, string, string][]
}

interface Data {
  title: string
  url: string
  time: string
}

const data1 = await readJson<History>(`C:/Users/Chilfish/Desktop/bilibili-history.json`).then(toData)

const data2 = await readJson<History>(`D:/Backups/bili/bilibili-history.json`).then(toData)

function toData(data: History): Data[] {
  return data.rows.map(([title, url, time]) => ({ title, url, time }))
}

const data = data1.concat(data2).sort((a, b) => b.time.localeCompare(a.time))

const data3 = uniqueObj(data, 'title')

writeJson(`C:/Users/Chilfish/Desktop/1-bilibili-history.json`, data3)
