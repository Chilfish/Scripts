import type { ITweet } from 'rettiwt-core/dist/types/base/Tweet'
import type {
  Legacy as IUserDetailsResult,
} from 'rettiwt-core/dist/types/user/Details'
import type { Result2 as ITweetsAndReplies } from 'rettiwt-core/dist/types/user/TweetsAndReplies'
import type { QuotedTweet, ReTweet, Tweet, User, UserInfo } from '~/types/tweet'

// import type quoteData from './data/quote.json'
// import type replyData from './data/reply.json'
// import type cardData from './data/retweet-card.json'
// import type retweetData from './data/retweet.json'
// import type textData from './data/text_img.json'

// type TextData = typeof textData
// type RetweetData = typeof retweetData
// type QuoteData = typeof quoteData
// type ReplyData = typeof replyData
// type CardData = typeof cardData

// export type TweetData = TextData | RetweetData | QuoteData | ReplyData | CardData
export type TweetData = { metadata: ITweetsAndReplies } & ITweet

function _getUser(data: TweetData) {
  const _data = {
    ...data,
    metadata: 'metadata' in data ? data.metadata : data,
  }
  const user = _data.metadata?.core.user_results.result

  if (!user || user.__typename !== 'User') {
    throw new Error('User not found')
  }
  return user
}

function filterUserInfo(data: TweetData): UserInfo {
  const user = _getUser(data)
  const { legacy } = user

  return {
    name: legacy.name,
    screenName: legacy.screen_name,
    avatarUrl: legacy.profile_image_url_https,
  }
}

function filterUserDetails(data: IUserDetailsResult, id: string): User {
  return {
    restId: id,
    name: data.name,
    screenName: data.screen_name,
    avatarUrl: data.profile_image_url_https,
    profileBannerUrl: data.profile_banner_url,
    followersCount: data.followers_count,
    followingCount: data.friends_count,
    location: data.location,
    bio: data.description,
    // @ts-expect-error okok
    website: data.entities.url?.urls[0].expanded_url || '',
    createdAt: new Date(data.created_at),
    birthday: new Date(),
    tweetStart: new Date(),
    tweetEnd: new Date(),
  }
}

function filterUser(data: TweetData, birthday = new Date()): User {
  const user = _getUser(data)
  const { legacy } = user

  const website = legacy.entities.url?.urls[0].expanded_url || ''

  const bio = legacy.entities.description.urls.reduce(
    (acc, url) => acc.replace(url.url, url.expanded_url),
    legacy.description,
  )

  const profileBannerUrl
    = 'profile_banner_url' in legacy ? legacy.profile_banner_url : ''

  return {
    ...filterUserInfo(data),
    restId: user.rest_id,
    profileBannerUrl,
    followersCount: legacy.followers_count,
    followingCount: legacy.friends_count,
    location: legacy.location,
    bio,
    website,
    createdAt: new Date(legacy.created_at),
    birthday,
    tweetStart: new Date(),
    tweetEnd: new Date(),
  }
}

function _filterTweet(data: TweetData): Tweet {
  const tweet = data.metadata.legacy

  if (!tweet?.id_str) {
    throw new Error('Tweet not found')
  }

  const mediaLinks = tweet.extended_entities?.media || []

  const media = mediaLinks.map((m) => {
    const isVideo = m.type === 'video'
    let url = m.media_url_https
    if (isVideo) {
      // @ts-expect-error it's a video
      url = m.video_info.variants
        .filter((v: any) => v.content_type === 'video/mp4')
        .sort((a: any, b: any) => b.bitrate - a.bitrate)[0]
        .url
    }

    return {
      url,
      type: m.type,
      height: m.original_info.height,
      width: m.original_info.width,
    }
  })

  let text = mediaLinks.reduce(
    (acc, m) => acc.toString().replace(` ${m.url}`, ''),
    tweet.full_text,
  )

  text = tweet.entities.urls.reduce(
    (acc, url) => acc.replace(url.url, url.expanded_url),
    text,
  )

  const isRetweet = 'retweeted_status_result' in (data.metadata?.legacy || {})
  const isQuote = 'quoted_status_result' in (data.metadata || {})

  return {
    id: tweet.id_str,
    tweetId: tweet.id_str,
    userId: filterUserInfo(data).screenName,

    createdAt: new Date(tweet.created_at),
    fullText: isRetweet ? 'RT' : text,
    media,

    retweetCount: tweet.retweet_count,
    quoteCount: tweet.quote_count,
    replyCount: tweet.reply_count,
    favoriteCount: tweet.favorite_count,
    viewsCount: Number(data.views.count) || 0,

    retweetedStatus: isRetweet ? filterRetweet(data as any) : null,
    quotedStatus: isQuote ? filterQuotedTweet(data as any) : null,
  }
}

function filterTweet(data: TweetData): Tweet {
  let _data = data as any
  if ('legacy' in data) {
    _data = {
      ...data,
      metadata: data,
    }
  }
  else if (!('metadata' in data && 'legacy' in data.metadata)) {
    _data = {
      ...data,
      metadata: { legacy: data },
    }
  }
  return _filterTweet(_data)
}

function filterRetweet(data: TweetData): ReTweet | null {
  const retweet = data.metadata?.legacy.retweeted_status_result?.result

  if (!retweet || retweet.__typename !== 'Tweet') {
    return null
  }

  // @ts-expect-error it's a tweet
  const retweetedUser = filterUserInfo({ metadata: retweet })

  return {
    user: retweetedUser,
    tweet: filterTweet(retweet as any),
  }
}

function filterQuotedTweet(data: TweetData): QuotedTweet | null {
  const quotedTweet = data.metadata?.quoted_status_result?.result

  if (!quotedTweet || quotedTweet.__typename !== 'Tweet') {
    return null
  }

  // @ts-expect-error it's a tweet
  const quoteUser = filterUserInfo({ metadata: quotedTweet })

  return {
    user: quoteUser,
    tweet: filterTweet(quotedTweet as any),
  }
}

export {
  filterTweet,
  filterUser,
  filterUserDetails,
  filterUserInfo,
}
