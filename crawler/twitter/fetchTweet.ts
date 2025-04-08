import type { FetchArgs, FetcherService, Tweet as ITweet } from 'rettiwt-api'
import type {
  Root as IUserDetailsResponse,
  Legacy as IUserDetailsResult,
} from 'rettiwt-core/dist/types/user/Details'
import type {
  ItemContent as ITeetsItemContent,
  Root as ITweetsAndRepliesResponse,
} from 'rettiwt-core/dist/types/user/TweetsAndReplies'
import type { ReTweet, Tweet, User } from '~/types/tweet'
import { CursoredData, EResourceType } from 'rettiwt-api'

import { filterTweet as _filterTweet, filterUser } from './filterTweet'

import 'dotenv/config'

type FetchOptions = FetchArgs & {
  endAt: Date
  onFetched?: (data: {
    tweets: Tweet[]
    rawTweets: ITeetsItemContent[]
    cursor: string
  }) => any
  onError?: (err: any) => void
}

async function fetchUser(tweetApi: FetcherService, username: string) {
  const { data } = await tweetApi.request<IUserDetailsResponse>(
    EResourceType.USER_DETAILS_BY_USERNAME,
    { id: username },
  )

  return {
    user: data.user.result.legacy as IUserDetailsResult,
    restId: data.user.result.rest_id,
  }
}

async function _fetchTweet(tweetApi: FetcherService, fetchArgs: FetchArgs) {
  const res = await tweetApi.request<ITweetsAndRepliesResponse>(
    EResourceType.USER_TIMELINE_AND_REPLIES,
    fetchArgs,
  )

  const cursor = new CursoredData(res, 'Tweet' as any).next.value

  const tweets = (res.data.user.result as any).timeline.timeline.instructions.filter((res: any) => res.type === 'TimelineAddEntries').at(0).entries.flatMap(({ content }: any) => {
    // Threads
    if ('items' in content) {
      return content.items.map(({ item }: any) => item?.itemContent)
    }
    // normal tweets
    return content.itemContent
  }).filter(Boolean).filter(
    (tweet: any) => tweet.itemType === 'TimelineTweet',
  ) as ITeetsItemContent[]

  return {
    tweets,
    cursor,
  }
}

async function fetchTweet(
  tweetApi: FetcherService,
  fetchArgs: FetchOptions,
) {
  const tweets: Tweet[] = []
  const user = {} as User
  let cursor: string | undefined
  let lastTweetId = ''
  let lastTweetTime = new Date()

  while (true) {
    if (cursor) {
      fetchArgs.cursor = cursor
    }

    const { tweets: fetchedTweets, cursor: nextCursor } = await _fetchTweet(
      tweetApi,
      fetchArgs,
    ).catch((err) => {
      console.dir(err, { depth: 3 })
      fetchArgs.onError?.(err)
      return { tweets: [] as ITeetsItemContent[], cursor: '' }
    })

    const filteredTweets = fetchedTweets
      .map(filterTweet)
      .filter((tweet): tweet is Tweet => !!tweet)

    if (!filteredTweets.length) {
      console.warn('No tweets found')
      break
    }

    if (filteredTweets.at(-1)?.id === lastTweetId) {
      console.warn('Duplicate tweet found')
      break
    }

    try {
      Object.assign(
        user,
        filterUser(fetchedTweets[0].tweet_results.result as any),
      )
    }
    catch {

    }

    tweets.push(
      ...filteredTweets.filter(
        tweet => tweet.createdAt.getTime() >= fetchArgs.endAt.getTime(),
      ),
    )

    const lastTweet = filteredTweets.at(-1)?.createdAt || new Date()
    lastTweetTime = lastTweet

    console.log({
      lastTweet,
      endAt: fetchArgs.endAt,
      fetchedTweets: fetchedTweets.length,
      cursor: nextCursor,
    })

    await fetchArgs.onFetched?.({
      tweets: filteredTweets,
      rawTweets: fetchedTweets,
      cursor: nextCursor,
    }).catch((err: any) => {
      console.error('Error in onFetched', err)
    })

    // TODO: beacuse of rate-limt, maybe break at other condition
    if (lastTweet.getTime() <= fetchArgs.endAt.getTime()) {
      break
    }

    cursor = nextCursor
    lastTweetId = filteredTweets.at(-1)?.id || ''
  }

  user.tweetStart = tweets.at(-1)?.createdAt || new Date()
  user.tweetEnd = tweets.at(0)?.createdAt || new Date()

  return {
    tweets,
    user,
    cursor: cursor || '',
    lastTweetTime,
  }
}

async function _fetchTweetByRange(
  tweetApi: FetcherService,
  fetchArgs: FetchArgs,
) {
  const res = await tweetApi.request<ITweetsAndRepliesResponse>(
    EResourceType.TWEET_SEARCH,
    fetchArgs,
  )
  const data = new CursoredData<ITweet>(res, 'Tweet' as any)

  const nextCursor = data.next.value
  const tweets: Tweet[] = data.list.map(filterSearchTweet)

  return {
    nextCursor,
    tweets,
  }
}

async function fetchTweetByRange(
  tweetApi: FetcherService,
  fetchArgs: FetchOptions,
) {
  const tweets: Tweet[] = []
  let cursor = fetchArgs.cursor

  while (true) {
    const data = await _fetchTweetByRange(tweetApi, {
      ...fetchArgs,
      cursor,
    }).catch((err) => {
      console.error(err)
      return { nextCursor: '', tweets: [] as Tweet[] }
    })
    const lastTweet = data.tweets.at(-1)

    console.log({
      lastTime: lastTweet?.createdAt,
      cursor: data.nextCursor,
    })

    tweets.push(...data.tweets)
    await fetchArgs.onFetched?.({
      tweets: data.tweets,
      rawTweets: [],
      cursor: data.nextCursor,
    })

    if (
      !data.nextCursor
      || !lastTweet
      // || lastTweet.createdAt.getTime() <= fetchArgs.endAt.getTime()
    ) {
      break
    }

    cursor = data.nextCursor
  }

  return {
    cursor,
    tweets,
  }
}

function filterTweet(data: ITeetsItemContent) {
  const tweet = data.tweet_results.result
  try {
    return _filterTweet(tweet as any)
  }
  catch (err) {
    console.error('Error filtering tweet', err)
    return null
  }
}

function filterSearchTweet(tweet: ITweet): Tweet {
  return {
    tweetId: tweet.id,
    id: tweet.id,
    userId: tweet.tweetBy.userName,
    createdAt: new Date(tweet.createdAt),
    fullText: tweet.fullText,
    favoriteCount: tweet.likeCount,
    replyCount: tweet.replyCount,
    retweetCount: tweet.retweetCount,
    quoteCount: tweet.quoteCount,
    viewsCount: tweet.viewCount,
    retweetedStatus: {} as ReTweet,
    quotedStatus: tweet.quoted ? filterSearchTweet(tweet.quoted) : {},
    media: (tweet.media || []).map(media => ({
      url: media.url,
      type: media.type,
    })),
  } as Tweet
}

export { fetchTweet, fetchTweetByRange, fetchUser }
