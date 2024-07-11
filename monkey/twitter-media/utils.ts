import { getCookie } from '~/utils/cookie'
import { GM_getValue, GM_setValue } from '$'

/**
 * fetch the tweet detail by the status_id
 */
export async function fetchTweet(status_id: string) {
  const base_url = `https://${location.hostname}/i/api/graphql/NmCeCgkVlsRGS1cAwqtgmw/TweetDetail`
  const variables = { focalTweetId: status_id, with_rux_injections: false, includePromotedContent: true, withCommunity: true, withQuickPromoteEligibilityTweetFields: true, withBirdwatchNotes: true, withVoice: true, withV2Timeline: true }
  const features = { rweb_lists_timeline_redesign_enabled: true, responsive_web_graphql_exclude_directive_enabled: true, verified_phone_label_enabled: false, creator_subscriptions_tweet_preview_api_enabled: true, responsive_web_graphql_timeline_navigation_enabled: true, responsive_web_graphql_skip_user_profile_image_extensions_enabled: false, tweetypie_unmention_optimization_enabled: true, responsive_web_edit_tweet_api_enabled: true, graphql_is_translatable_rweb_tweet_is_translatable_enabled: true, view_counts_everywhere_api_enabled: true, longform_notetweets_consumption_enabled: true, responsive_web_twitter_article_tweet_consumption_enabled: false, tweet_awards_web_tipping_enabled: false, freedom_of_speech_not_reach_fetch_enabled: true, standardized_nudges_misinfo: true, tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled: true, longform_notetweets_rich_text_read_enabled: true, longform_notetweets_inline_media_enabled: true, responsive_web_media_download_video_enabled: false, responsive_web_enhance_cards_enabled: false }

  const url = encodeURI(`${base_url}?variables=${JSON.stringify(variables)}&features=${JSON.stringify(features)}`)
  const cookies = getCookie()
  const headers: Record<string, string> = {
    'authorization': 'Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA',
    'x-twitter-active-user': 'yes',
    'x-csrf-token': cookies.ct0,
  }

  if (cookies.ct0.length === 32)
    headers['x-guest-token'] = cookies.gt
  const tweet_detail = await fetch(url, { headers }).then(result => result.json())
  const tweet_entrie = tweet_detail.data
    .threaded_conversation_with_injections_v2
    .instructions[0]
    .entries
    .find((n: any) => n.entryId === `tweet-${status_id}`)

  const tweet_result = tweet_entrie.content.itemContent.tweet_results.result
  return tweet_result.tweet || tweet_result
}

export const idHistory: string[] = []
export const historyKey = 'download_history'
/**
 * get/set the download history from the GM storage
 */
export function useHistory(value?: string) {
  if (value === undefined) {
    idHistory.push(...(GM_getValue(historyKey, [])))
    return idHistory
  }

  idHistory.push(value)
  GM_setValue(historyKey, idHistory)
}
