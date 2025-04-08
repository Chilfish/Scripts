import type { Tweet } from '~/types/tweet'
import { FetcherService } from 'rettiwt-api'
import {
  argvParser,
  cachedData,
  config,
  writeJson,
} from '~/utils/nodejs'
import { fetchTweet, fetchTweetByRange, fetchUser } from './fetchTweet'
import { filterUserDetails } from './filterTweet'

const { name, cursor, endAt } = argvParser([
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
  {
    key: 'endAt',
    shortKey: 'e',
    description: '',
    default: new Date('2000-01-01'),
  },
] as const)

console.log({ name, cursor })

const dir = `data/twitter/${name}`

const tweetApi = new FetcherService({ apiKey: config.twitterKey })

const user = await cachedData(
  `${dir}/user.json`,
  async () => {
    const res = await fetchUser(tweetApi, name)
    return filterUserDetails(res.user, res.restId)
  },
)

const tweets = new Map<string, Tweet>()
const rawTweet: any[] = []
const now = Date.now()
const fetchEndAt = new Date(endAt)
let lastCursor = cursor

const { lastTweetTime } = await fetchTweet(tweetApi, {
  id: user.restId,
  endAt: fetchEndAt,
  cursor,
  async onFetched({ tweets: filteredTweets, rawTweets, cursor: nextCursor }) {
    filteredTweets.forEach((tweet) => {
      if (tweets.has(tweet.id) || tweet.userId !== user.screenName) {
        return
      }
      tweets.set(tweet.id, tweet)
    })
    lastCursor = nextCursor
    rawTweet.push(...rawTweets)

    await writeJson(
      `${dir}/${now}-append.json`,
      filteredTweets,
      'append',
    )
  },
}).catch((err) => {
  console.error('Error fetching tweets', err)
  return {
    lastTweetTime: new Date(),
  }
})

if (!tweets.size) {
  console.warn('No tweets fetched')
  process.exit(0)
}

console.log({
  lastTweetTime,
  fetchEndAt,
})

if (lastTweetTime.getTime() >= fetchEndAt.getTime()) {
  await fetchTweetByRange(tweetApi, {
    filter: {
      startDate: fetchEndAt,
      endDate: lastTweetTime,
      fromUsers: [user.screenName],
      // top: false,
    },
    endAt: new Date(),
    async onFetched({ tweets: filteredTweets, cursor: nextCursor }) {
      filteredTweets.forEach((tweet) => {
        if (tweets.has(tweet.id) || tweet.userId !== user.screenName) {
          return
        }
        tweets.set(tweet.id, tweet)
      })
      if (nextCursor) {
        lastCursor = nextCursor
      }

      await writeJson(
        `${dir}/${now}-append.json`,
        filteredTweets,
        'append',
      )
    },
  })
}

console.log(tweets.size, 'tweets fetched')
await writeJson(
  `${dir}/${now}-all-${lastCursor}.json`,
  Array.from(tweets.values()),
)

await writeJson(
  `${dir}/${now}-raw-${lastCursor}.json`,
  rawTweet,
)
