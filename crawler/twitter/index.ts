import { CursoredData, EResourceType, FetcherService, Rettiwt } from 'rettiwt-api'

import {
  argvParser,
  baseDir,
  cachedData,
  config,
} from '~/utils/nodejs'

const tmp = baseDir('data/twitter')

const { name, force, help } = argvParser([
  {
    key: 'name',
    shortKey: 'n',
    description: 'The name of the user to fetch tweets from',
  },
  {
    key: 'force',
    shortKey: 'f',
    description: 'Force fetching the data again',
    defaultValue: false,
    type: 'boolean',
  },
] as const)

if (!name) {
  console.error('Missing --name argument')
  help()
  process.exit(1)
}

const rettiwt = new Rettiwt({ apiKey: config.twitterKey })
const tweetApi = new FetcherService({ apiKey: config.twitterKey })

const user = await cachedData(
  tmp(`users/${name}.json`),
  () => rettiwt.user.details(name),
)

console.log(user)

if (!user) {
  console.error('User not found')
  process.exit(1)
}

const tweets = await cachedData(
  tmp(`tweets/${name}.json`),
  async () => {
    const res = await tweetApi.request<any>(
      EResourceType.USER_TIMELINE_AND_REPLIES,
      { id: user.id },
    )
    const data = new CursoredData(res, 'Tweet' as any)
    return data
  },
  force,
)

console.log(tweets.list.length)
