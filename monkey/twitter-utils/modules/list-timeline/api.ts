import { TimelineInstructions, Tweet } from '~/types'
import { Interceptor } from '../../extensions'
import { extractDataFromResponse, extractTimelineTweet } from '../../utils/api'
import logger from '../../utils/logger'

interface ListTimelineResponse {
  data: {
    list: {
      tweets_timeline: {
        timeline: {
          instructions: TimelineInstructions
          metadata: unknown
        }
      }
    }
  }
}

// https://twitter.com/i/api/graphql/asz3yj2ZCgJt3pdZEY2zgA/ListLatestTweetsTimeline
export const ListTimelineInterceptor: Interceptor = (req, res, ext) => {
  logger.info(req.method, req.url, res.status)
  if (!/\/graphql\/.+\/ListLatestTweetsTimeline/.test(req.url)) {
    return
  }

  try {
    const newData = extractDataFromResponse<ListTimelineResponse, Tweet>(
      res,
      json => json.data.list.tweets_timeline.timeline.instructions,
      entry => extractTimelineTweet(entry.content.itemContent),
    )
    // console.log(newData)

    logger.info(`ListTimeline: ${newData.length} items received`)

    const tweets = rmRetweets(newData)
    console.log(tweets)

    res.responseText = JSON.stringify(tweets)
  }
  catch (err) {
    logger.debug(req.method, req.url, res.status, res.responseText)
    logger.errorWithBanner('ListTimeline: Failed to parse API response', err as Error)
  }
}

function rmRetweets(tweets: Tweet[]) {
  const isRetweet = (tweet: Tweet) => tweet.legacy.full_text.startsWith('RT @')

  return tweets.filter(tweet => !isRetweet(tweet))
}
