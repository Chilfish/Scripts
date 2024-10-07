import { $, $$, downloader, store } from '~/monkey/utils'
import { getCookie } from '~/utils/cookie'
import { formatDate } from '~/utils/date'

import style from './style.css?raw'

/**
 * fetch the tweet detail by the status_id
 */
async function fetchTweet(status_id: string) {
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

const historyKey = 'download_history'
const idHistory = store.get<string[]>(historyKey, [])!
function useHistory(value?: string) {
  if (value) {
    idHistory.push(value)
    store.set(historyKey, idHistory)
  }

  return idHistory
}

const downBtn = `<svg viewBox="0 0 24 24" style="width: 18px; height: 18px;"><g class="download"><path d="M3,14 v5 q0,2 2,2 h14 q2,0 2,-2 v-5 M7,10 l4,4 q1,1 2,0 l4,-4 M12,3 v11" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" /></g>
<g class="completed"><path d="M3,14 v5 q0,2 2,2 h14 q2,0 2,-2 v-5 M7,10 l3,4 q1,1 2,0 l8,-11" fill="none" stroke="#1DA1F2" stroke-width="2" stroke-linecap="round" /></g>
<g class="loading"><circle cx="12" cy="12" r="10" fill="none" stroke="#1DA1F2" stroke-width="4" opacity="0.4" /><path d="M12,2 a10,10 0 0 1 10,10" fill="none" stroke="#1DA1F2" stroke-width="4" stroke-linecap="round" /></g>
<g class="failed"><circle cx="12" cy="12" r="11" fill="#f33" stroke="currentColor" stroke-width="2" opacity="0.8" /><path d="M14,5 a1,1 0 0 0 -4,0 l0.5,9.5 a1.5,1.5 0 0 0 3,0 z M12,17 a2,2 0 0 0 0,4 a2,2 0 0 0 0,-4" fill="#fff" stroke="none" /></g></svg>
`

function detect(node: HTMLElement | null) {
  if (!node)
    return

  const isArticle = node.tagName === 'ARTICLE' || node.tagName === 'DIV'
  const article = isArticle
    ? $('article', node) || node.closest('article')
    : null

  if (article)
    addButtonToImgs(article)

  const isListItems = node.tagName === 'LI' && node.getAttribute('role') === 'listitem' && [node] || node.tagName === 'DIV'
  const listitems = isListItems
    ? $$('li[role="listitem"]', node)
    : null

  listitems?.forEach(item => addButtonToMediaList(item))
}

function createDownBtn() {
  const btn_down = document.createElement('div')
  btn_down.innerHTML = `<div><div>${downBtn}</div></div>`
  return btn_down
}

function addButtonToImgs(article: HTMLElement) {
  if (article.dataset.detected)
    return
  article.dataset.detected = 'true'

  const media_selector = [
    'a[href*="/photo/1"]',
    'div[role="progressbar"]',
    'div[data-testid="playButton"]',
    'a[href="/settings/content_you_see"]', // hidden content
    'div.media-image-container', // for tweetdeck
    'div.media-preview-container', // for tweetdeck
    'div[aria-labelledby]>div:first-child>div[role="button"][tabindex="0"]', // for audio (experimental)
  ]
  const media = $(media_selector.join(','), article)
  if (!media)
    return

  const status_item = $<HTMLAnchorElement>('a[href*="/status/"]', article)
  const status_id = getStatusId(status_item)
  if (!status_id)
    return

  const btn_group = $('div[role="group"]:last-of-type, ul.tweet-actions, ul.tweet-detail-actions', article)
  const btn_share = $$(':scope>div>div, li.tweet-action-item>a, li.tweet-detail-action-item>a', btn_group).pop()!.parentNode!

  const btn_down = btn_share.cloneNode(true) as HTMLElement

  $('svg', btn_down)!.innerHTML = downBtn

  const is_exist = idHistory.includes(status_id)
  const title = is_exist ? 'completed' : 'download'
  set_status(btn_down, 'tmd-down')
  set_status(btn_down, title, title)

  btn_group?.insertBefore(btn_down, btn_share.nextSibling)
  btn_down.onclick = () => click(btn_down, status_id, is_exist)

  const imgs = $$<HTMLAnchorElement>('a[href*="/photo/"]', article)
  if (imgs.length < 1)
    return

  imgs.forEach((img) => {
    const index = Number(img.href.split('/status/').pop()?.split('/').pop()) || 0
    const is_exist = idHistory.includes(status_id)

    const btn_down = createDownBtn()
    btn_down.classList.add('tmd-down', 'tmd-img')
    btn_down.onclick = (e) => {
      e.preventDefault()
      click(btn_down, status_id, is_exist, index)
    }

    img.parentNode?.appendChild(btn_down)
    set_status(btn_down, 'download')
  })
}

function getStatusId(item: HTMLAnchorElement | null) {
  const regex = /\/status\/(\d+)/
  const status_id = item?.href.match(regex)?.[1]

  return status_id || ''
}

function addButtonToMediaList(item: HTMLElement) {
  if (item.dataset.detected)
    return
  item.dataset.detected = 'true'
  const status_item = $<HTMLAnchorElement>('a[href*="/status/"]', item)
  const status_id = getStatusId(status_item)

  const is_exist = idHistory.includes(status_id)
  const btn_down = createDownBtn()
  btn_down.classList.add('tmd-down', 'tmd-media')
  btn_down.onclick = () => click(btn_down, status_id, is_exist)

  set_status(
    btn_down,
    is_exist ? 'completed' : 'download',
    is_exist ? 'completed' : 'download',
  )
  item.appendChild(btn_down)
}

/**
 * handle the click event of the download button
 */
async function click(
  btn: HTMLElement,
  status_id: string,
  is_exist: boolean,
  index?: number,
) {
  if (btn.classList.contains('loading'))
    return

  set_status(btn, 'loading')
  const json = await fetchTweet(status_id)
  const tweet = json.legacy
  const user = json.core.user_results.result.legacy

  const info: Record<string, string> = {}

  const outFmt = `{user-id}-{date-time}-{status-id}`
  info['status-id'] = status_id
  info['user-name'] = user.name
  info['user-id'] = user.screen_name
  info['date-time'] = formatDate(tweet.created_at, 'YYYYMMDD_HHmmss')

  let medias = tweet.extended_entities && tweet.extended_entities.media

  if (index)
    medias = [medias[index - 1]]
  if (medias.length < 1) {
    set_status(btn, 'failed', 'MEDIA_NOT_FOUND')
    return
  }

  let tasks = medias.length

  const tasks_result: string[] = []

  medias.forEach((media: any, i: number) => {
    info.url = `${media.media_url_https.replace('jpg', 'png')}:large`
    info.file = info.url.split('/').pop()?.split(/[:?]/).shift() || 'media'
    info['file-name'] = info.file.split('.').shift() || 'media'
    info['file-ext'] = info.file.split('.').pop() || 'jpg'
    info['file-type'] = media.type.replace('animated_', '') || 'photo'

    // Remove the {file-ext} placeholder and append the index if needed
    const shouldAppendIndex = (medias.length > 1 || index) && outFmt.match('{file-name}')
    const indexSuffix = shouldAppendIndex ? `-${index ? index - 1 : i}` : ''
    const formattedOut = `${outFmt}${indexSuffix}.{file-ext}`

    // Replace placeholders in the formatted string with actual values from info
    info.out = formattedOut.replace(/\{([^{}:]+)(:[^{}]+)?\}/g, (_match, name) => info[name])

    downloader.add({
      url: info.url,
      name: info.out,
      onload: async () => {
        tasks -= 1
        tasks_result.push((medias.length > 1 || index) ? `${index || i + 1}: ` : '')
        set_status(btn, undefined, tasks_result.sort().join('\n'))

        if (tasks > 0)
          return

        set_status(btn, 'completed', 'completed')
        if (!is_exist) {
          idHistory.push(status_id)
          useHistory(status_id)
        }
      },
      onerror: (result) => {
        tasks = -1
        tasks_result.push((medias.length > 1 ? `${i + 1}: ` : '') + result.details.current)
        set_status(btn, 'failed', tasks_result.sort().join('\n'))
      },
    })
  })
}

/**
 * set the status of the button
 */
function set_status(
  btn: HTMLElement,
  className?: string,
  title?: string,
) {
  if (className) {
    btn.classList.remove('download', 'completed', 'loading', 'failed')
    btn.classList.add(className)
  }
  if (title)
    btn.title = title
}

export default {
  tagName: 'DIV',
  style,
  action: detect,
}
