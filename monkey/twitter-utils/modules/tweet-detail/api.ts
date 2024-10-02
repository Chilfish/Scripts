import { Interceptor } from '@/extensions'
import {
  extractTimelineTweet,
  isTimelineEntryTweet,
} from '@/utils/api'
import logger from '@/utils/logger'
import {
  TimelineAddEntriesInstruction,
  TimelineInstructions,
  TimelineTweet,
} from '~/types'
import { editTweet, viewInArchiver } from './dom'

interface TweetDetailResponse {
  data: {
    threaded_conversation_with_injections_v2: {
      instructions: TimelineInstructions
    }
  }
}

// https://twitter.com/i/api/graphql/8sK2MBRZY9z-fgmdNpR3LA/TweetDetail
export const TweetDetailInterceptor: Interceptor = (req, res, ext) => {
  if (!/\/graphql\/.+\/TweetDetail/.test(req.url)) {
    return
  }

  try {
    const json: TweetDetailResponse = JSON.parse(res.responseText)
    const instructions = json.data.threaded_conversation_with_injections_v2.instructions

    const timelineAddEntriesInstruction = instructions.find(
      i => i.type === 'TimelineAddEntries',
    ) as TimelineAddEntriesInstruction<TimelineTweet>

    // When loading more tweets in conversation, the "TimelineAddEntries" instruction may not exist.
    const timelineAddEntriesInstructionEntries = timelineAddEntriesInstruction?.entries ?? []

    for (const entry of timelineAddEntriesInstructionEntries) {
      // The main tweet.
      if (isTimelineEntryTweet(entry)) {
        const tweet = extractTimelineTweet(entry.content.itemContent)
        if (tweet) {
          continue
          // newData.push(tweet)
        }
        // The main tweet is deleted.
        else {
          const tweetId = entry.entryId.split('-')[1]
          const replyItem = timelineAddEntriesInstructionEntries[1]

          // @ts-expect-error user_mentions
          const name = replyItem.content?.itemContent.tweet_results.result.legacy.entities.user_mentions[0]?.screen_name || 'i'

          viewInArchiver(tweetId, name)
        }
      }

      // The conversation thread.
      // if (isTimelineEntryConversationThread(entry)) {
      //   // Be careful about the "conversationthread-{id}-cursor-showmore-{cid}" item.
      //   const tweetsInConversation = entry.content.items.map((i) => {
      //     if (i.entryId.includes('-tweet-')) {
      //       return extractTimelineTweet(i.item.itemContent)
      //     }
      //     return null
      //   })

      //   newData.push(...tweetsInConversation.filter((t): t is Tweet => !!t))
      // }
    }

    // // Lazy-loaded conversations.
    // const timelineAddToModuleInstruction = instructions.find(
    //   i => i.type === 'TimelineAddToModule',
    // ) as TimelineAddToModuleInstruction<TimelineTweet>

    // if (timelineAddToModuleInstruction) {
    //   const tweetsInConversation = timelineAddToModuleInstruction.moduleItems
    //     .map(i => extractTimelineTweet(i.item.itemContent))
    //     .filter((t): t is Tweet => !!t)

    //   newData.push(...tweetsInConversation)
    // }

    // logger.info(`TweetDetail: ${newData.length} items received`)

    editTweet()
  }
  catch (err) {
    logger.debug(req.method, req.url, res.status, res.responseText)
    logger.errorWithBanner('TweetDetail: Failed to parse API response', err as Error)

    const urls = location.pathname.split('/')
    const name = urls[1]
    const id = urls.at(-1) || ''

    viewInArchiver(id, name)
  }
}
