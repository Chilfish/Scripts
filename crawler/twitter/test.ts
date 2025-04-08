import { FetcherService, Rettiwt } from 'rettiwt-api'
import {
  argvParser,
  config,
  writeJson,
} from '~/utils/nodejs'
import { fetchTweetByRange } from './fetchTweet'

const { name, cursor } = argvParser([
  {
    key: 'name',
    shortKey: 'n',
    description: 'The name of the user to fetch tweets from',
    required: true,
  },
  {
    key: 'cursor',
    shortKey: 'c',
    description: 'The cursor to start fetching tweets from',
    default: undefined,
  },
] as const)

if (!name) {
  console.error('Missing --name argument')
  process.exit(1)
}

const rettiwt = new Rettiwt({ apiKey: config.twitterKey })
const tweetApi = new FetcherService({ apiKey: config.twitterKey })

const user = await rettiwt.user.details(name)
if (!user) {
  console.error(`User ${name} not found`)
  process.exit(1)
}

// const res = await tweetApi.request<any>(
//   EResourceType.TWEET_SEARCH,
//   {
//     cursor,
//     filter: {
//       endDate: new Date('2025-02-01'),
//       fromUsers: [user.userName]
//     }
//   },
// )
// const data = new CursoredData<Tweet>(res, 'Tweet' as any)

const data = await fetchTweetByRange(tweetApi, {
  filter: {
    startDate: new Date('2024-02-01'),
    fromUsers: [user.userName],
    // top: false,
  },
  endAt: new Date(),
})

await writeJson('data/twitter/tmp.json', data)
