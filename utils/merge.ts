import { readJson, writeJson } from './file'

const oldData = await readJson('D:/Videos/BangDream/声优/json-data/twitter-用户推文-青木阳菜.json') as any[]
const newData = await readJson('D:/Downloads/twitter-UserTweets-1721051608476.json') as any[]

const merged = Array
  .from(new Set([...oldData, ...newData]))
  .sort((a, b) => Number(b.id) - Number(a.id))

await writeJson('D:/Downloads/data.json', merged)
