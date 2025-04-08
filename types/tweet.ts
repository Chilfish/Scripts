export interface UserInfo {
  /**
   * display User name.
   */
  name: string
  /**
   * ID of the user.
   */
  screenName: string
  avatarUrl: string
}

export interface User extends UserInfo {
  restId: string
  profileBannerUrl: string
  followersCount: number
  followingCount: number
  bio: string
  location: string
  website: string
  birthday: Date
  createdAt: Date

  tweetStart: Date
  tweetEnd: Date
}

export interface TweetMedia {
  /**
   * media_url_https, ?name=large
   */
  url: string
  type: string
  height: number
  width: number
}

export interface Tweet {
  /**
   *  Tweet ID
   */
  id: string

  tweetId: string

  userId: string
  /**
   *  Tweet creation date.
   */
  createdAt: Date
  /**
   *  Tweet text content.
   */
  fullText: string
  /**
   *  URLs of the media attached to the tweet.
   */
  media: TweetMedia[]

  // Tweet metrics
  retweetCount: number
  quoteCount: number
  replyCount: number
  favoriteCount: number
  viewsCount: number

  /**
   * retweeted_status_result.result
   */
  retweetedStatus: ReTweet | null

  /**
   * quoted_status_result.result
   */
  quotedStatus: QuotedTweet | null
}

export interface ReTweet {
  user: UserInfo
  tweet: Tweet
}

export interface QuotedTweet {
  user: UserInfo
  /**
   * full_text: note_tweet.note_tweet_results.result.text
   */
  tweet: Tweet
}
