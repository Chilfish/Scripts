import glob from 'fast-glob'
import { hash } from 'ohash'
import { dir, readJson, writeJson } from '~/utils/file'

const folder = dir('D:/Codes/static/tweet')

type TweetKey = `data-${string}`

interface TweetConfig {
  name: TweetKey
  version: string
  tweetRange: {
    start: number
    end: number
  }
}

const versions = [] as TweetConfig[]

const files = await glob(`${folder}/data-*.json`)

for (const file of files) {
  console.log(`Hashing ${file}`)
  const filename = file.split('/').pop()?.split('.').shift()

  const data = await readJson(file)
  const version = hash(data)

  const key = `${filename}` as TweetKey
  const tweets = data.tweets
  const start = new Date(tweets[0].created_at).getTime()
  const end = new Date(tweets[tweets.length - 1].created_at).getTime()

  versions.push({
    name: key,
    version,
    tweetRange: {
      start,
      end,
    },
  })
}

await writeJson(`${folder}/versions.json`, versions)
