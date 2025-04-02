import { Interceptor } from '@/extensions'
import {
  extractTimelineTweet,
  isTimelineEntrySearchGrid,
  isTimelineEntryTweet,
} from '@/utils/api'
import logger from '@/utils/logger'
import {
  ItemContentUnion,
  TimelineAddEntriesInstruction,
  TimelineAddToModuleInstruction,
  TimelineInstructions,
  TimelineTweet,
  Tweet,
} from '~/types'
import { $$, waitForElement } from '~/utils/dom'

interface SearchTimelineResponse {
  data: {
    search_by_raw_query: {
      search_timeline: {
        timeline: {
          instructions: TimelineInstructions
          responseObjects: unknown
        }
      }
    }
  }
}

// https://twitter.com/i/api/graphql/Aj1nGkALq99Xg3XI0OZBtw/SearchTimeline
export const SearchTimelineInterceptor: Interceptor = (req, res, ext) => {
  if (!/\/graphql\/.+\/SearchTimeline/.test(req.url)) {
    return
  }

  try {
    const json: SearchTimelineResponse = JSON.parse(res.responseText)
    const instructions = json.data.search_by_raw_query.search_timeline.timeline.instructions

    // Parse tweets in search results.
    // Currently, only "Top", "Latest" and "Media" are supported. "People" and "Lists" are ignored.
    const newTweets: Tweet[] = []

    // The most complicated part starts here.
    //
    // For "Top" and "Latest", the "TimelineAddEntries" instruction contains normal tweets.
    // For "People", the "TimelineAddEntries" instruction contains normal users.
    // For "Media", the "TimelineAddEntries" instruction initializes "search-grid" module.
    // For "Lists", the "TimelineAddToModule" instruction initializes "list-search" module.
    const timelineAddEntriesInstruction = instructions.find(
      i => i.type === 'TimelineAddEntries',
    ) as TimelineAddEntriesInstruction<ItemContentUnion>

    // There will be two requests for "Media" and "Lists" search results.
    // The "TimelineAddToModule" instruction then prepends items to existing module.
    const timelineAddToModuleInstruction = instructions.find(
      i => i.type === 'TimelineAddToModule',
    ) as TimelineAddToModuleInstruction<ItemContentUnion>

    // The "TimelineAddEntries" instruction may not exist in some cases.
    const timelineAddEntriesInstructionEntries = timelineAddEntriesInstruction?.entries ?? []

    // First, parse "TimelineAddEntries" instruction.
    for (const entry of timelineAddEntriesInstructionEntries) {
      // Extract normal tweets.
      if (isTimelineEntryTweet(entry)) {
        const tweet = extractTimelineTweet(entry.content.itemContent)
        if (tweet) {
          newTweets.push(tweet)
        }
      }

      // Extract media tweets.
      if (isTimelineEntrySearchGrid(entry)) {
        const tweetsInSearchGrid = entry.content.items
          .map(i => extractTimelineTweet(i.item.itemContent))
          .filter((t): t is Tweet => !!t)

        newTweets.push(...tweetsInSearchGrid)
      }
    }

    // Second, parse "TimelineAddToModule" instruction.
    if (timelineAddToModuleInstruction) {
      const items = timelineAddToModuleInstruction.moduleItems.map(i => i.item.itemContent)

      const tweets = items
        .filter((i): i is TimelineTweet => i.__typename === 'TimelineTweet')
        .map(t => extractTimelineTweet(t))
        .filter((t): t is Tweet => !!t)

      newTweets.push(...tweets)
    }

    waitForElement('article time').then(() => {
      const articles = $$('article')
      console.log(`Articles: ${articles.length}`)

      articles.forEach((article, idx) => {
        if (article.dataset.replyId) {
          return
        }

        const tweet = newTweets[idx]
        const replyToid = tweet.legacy.in_reply_to_status_id_str || 'none'
        article.dataset.replyId = replyToid
      })
    })

    // newTweets.forEach((tweet) => {
    //   const replyToid = tweet.legacy.in_reply_to_status_id_str || ''
    // })

    logger.info(`SearchTimeline: ${newTweets.length} items received`)
  }
  catch (err) {
    logger.debug(req.method, req.url, res.status, res.responseText)
    logger.errorWithBanner('SearchTimeline: Failed to parse API response', err as Error)
  }
}
