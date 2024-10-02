import { Interceptor } from '@/extensions'
import { extractDataFromResponse, extractTimelineTweet } from '@/utils/api'
import logger from '@/utils/logger'
import { TimelineInstructions, Tweet } from '~/types'

interface LikesResponse {
  data: {
    user: {
      result: {
        timeline_v2: {
          timeline: {
            instructions: TimelineInstructions
            responseObjects: unknown
          }
        }
        __typename: 'User'
      }
    }
  }
}

// https://twitter.com/i/api/graphql/lVf2NuhLoYVrpN4nO7uw0Q/Likes
export const LikesInterceptor: Interceptor = (req, res, ext) => {
  if (!/\/graphql\/.+\/Likes/.test(req.url)) {
    return
  }

  try {
    const newData = extractDataFromResponse<LikesResponse, Tweet>(
      res,
      json => json.data.user.result.timeline_v2.timeline.instructions,
      entry => extractTimelineTweet(entry.content.itemContent),
    )

    logger.info(`Likes: ${newData.length} items received`)
  }
  catch (err) {
    logger.debug(req.method, req.url, res.status, res.responseText)
    logger.errorWithBanner('Likes: Failed to parse API response', err as Error)
  }
}
