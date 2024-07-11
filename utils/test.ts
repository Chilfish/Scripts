import { readJson, writeJson } from './file'

const oldData = await readJson('D:/Backups/twitter-喜欢-1716837973875.json') as any[]
const newData = await readJson('D:/Downloads/twitter-Likes-1720677666320.json') as any[]

const merged = Array
  .from(new Set([...oldData, ...newData]))
  .sort((a, b) => Number(b.id) - Number(a.id))

await writeJson('D:/Downloads/twitter-喜欢-1716837973875.json', merged)
