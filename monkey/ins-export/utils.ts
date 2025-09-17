import { InsData, TweetData } from './types'

export function ins2Tweet(data: InsData): TweetData {
  const createdAt = new Date(data.createdAt).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZone: 'Asia/Shanghai',
  })

  return {
    id: data.id,
    tweetId: data.shortcode,
    userId: data.author.username,
    createdAt,
    fullText: data.caption,
    media: data.media,
    retweetCount: 0,
    quoteCount: 0,
    replyCount: data.commentCount,
    favoriteCount: data.likeCount,
    viewsCount: 0,
    retweetedStatus: null,
    quotedStatus: null,
  }
}
