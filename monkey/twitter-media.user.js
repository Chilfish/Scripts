// ==UserScript==
// @name         Twitter media downloader
// @namespace    chilfish/monkey
// @version      2024.06.09
// @author       monkey
// @description  Download Twitter media
// @icon         https://abs.twimg.com/favicons/twitter.ico
// @downloadURL  https://github.com/Chilfish/Scripts/raw/main/monkey/twitter-media.user.js
// @updateURL    https://github.com/Chilfish/Scripts/raw/main/monkey/meta/twitter-media.meta.js
// @match        https://twitter.com/*
// @match        https://x.com/*
// @grant        GM_download
// @grant        GM_getValue
// @grant        GM_setValue
// ==/UserScript==

(function () {
  'use strict'

  const _GM_download = /* @__PURE__ */ (() => typeof GM_download != 'undefined' ? GM_download : void 0)()
  const _GM_getValue = /* @__PURE__ */ (() => typeof GM_getValue != 'undefined' ? GM_getValue : void 0)()
  const _GM_setValue = /* @__PURE__ */ (() => typeof GM_setValue != 'undefined' ? GM_setValue : void 0)()
  const downloader = /* @__PURE__ */ (() => {
    const tasks = []
    const MAX_RETRY = 2
    let activeThreads = 0
    const MAX_THREADS = 2
    let retryCount = 0
    function addTask(task) {
      tasks.push(task)
      if (activeThreads < MAX_THREADS) {
        activeThreads++
        processNextTask()
      }
    }
    async function processNextTask() {
      const task = tasks.shift()
      if (!task)
        return
      await executeTask(task)
      if (tasks.length > 0 && activeThreads <= MAX_THREADS)
        processNextTask()
      else
        activeThreads--
    }
    const handleRetry = (task, result) => {
      let _a
      retryCount++
      if (retryCount === 3)
        activeThreads = 1
      if (task.retry && task.retry >= MAX_RETRY || ((_a = result.details) == null ? void 0 : _a.current) === 'USER_CANCELED') {
        task.onerror(result)
      }
      else {
        if (activeThreads === 1)
          task.retry = (task.retry || 0) + 1
        addTask(task)
      }
    }
    function executeTask(task) {
      return new Promise(
        resolve => _GM_download({
          url: task.url,
          name: task.name,
          onload: () => {
            task.onload()
            resolve()
          },
          onerror: (result) => {
            handleRetry(task, result)
            resolve()
          },
          ontimeout: () => {
            handleRetry(task, { details: { current: 'TIMEOUT' } })
            resolve()
          },
        }),
      )
    }
    return { add: addTask }
  })()
  function getCookie(cookie) {
    if (!cookie)
      cookie = document.cookie
    if (typeof cookie === 'object') {
      const cookies2 = {}
      cookie.forEach(({ name, value }) => {
        cookies2[name] = value
      })
      return cookies2
    }
    const cookies = cookie.split(';').map(cookie2 => cookie2.split('=').map(c => c.trim())).reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {})
    return cookies
  }
  async function fetchTweet(status_id) {
    const base_url = `https://${location.host}/i/api/graphql/NmCeCgkVlsRGS1cAwqtgmw/TweetDetail`
    const variables = { focalTweetId: status_id, with_rux_injections: false, includePromotedContent: true, withCommunity: true, withQuickPromoteEligibilityTweetFields: true, withBirdwatchNotes: true, withVoice: true, withV2Timeline: true }
    const features = { rweb_lists_timeline_redesign_enabled: true, responsive_web_graphql_exclude_directive_enabled: true, verified_phone_label_enabled: false, creator_subscriptions_tweet_preview_api_enabled: true, responsive_web_graphql_timeline_navigation_enabled: true, responsive_web_graphql_skip_user_profile_image_extensions_enabled: false, tweetypie_unmention_optimization_enabled: true, responsive_web_edit_tweet_api_enabled: true, graphql_is_translatable_rweb_tweet_is_translatable_enabled: true, view_counts_everywhere_api_enabled: true, longform_notetweets_consumption_enabled: true, responsive_web_twitter_article_tweet_consumption_enabled: false, tweet_awards_web_tipping_enabled: false, freedom_of_speech_not_reach_fetch_enabled: true, standardized_nudges_misinfo: true, tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled: true, longform_notetweets_rich_text_read_enabled: true, longform_notetweets_inline_media_enabled: true, responsive_web_media_download_video_enabled: false, responsive_web_enhance_cards_enabled: false }
    const url = encodeURI(`${base_url}?variables=${JSON.stringify(variables)}&features=${JSON.stringify(features)}`)
    const cookies = getCookie()
    const headers = {
      'authorization': 'Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA',
      'x-twitter-active-user': 'yes',
      'x-csrf-token': cookies.ct0,
    }
    if (cookies.ct0.length === 32)
      headers['x-guest-token'] = cookies.gt
    const tweet_detail = await fetch(url, { headers }).then(result => result.json())
    const tweet_entrie = tweet_detail.data.threaded_conversation_with_injections_v2.instructions[0].entries.find(n => n.entryId === `tweet-${status_id}`)
    const tweet_result = tweet_entrie.content.itemContent.tweet_results.result
    return tweet_result.tweet || tweet_result
  }
  const idHistory = []
  const historyKey = 'download_history'
  function useHistory(value) {
    if (value === void 0) {
      idHistory.push(..._GM_getValue(historyKey, []))
      return idHistory
    }
    idHistory.push(value)
    _GM_setValue(historyKey, idHistory)
  }
  function formatDate(time, fmt = 'YYYY-MM-DD HH:mm:ss') {
    if (typeof time === 'number' && time < 1e12)
      time *= 1e3
    const date = new Date(time)
    if (Number.isNaN(date.getTime()))
      return ''
    const pad = num => num.toString().padStart(2, '0')
    const year = date.getUTCFullYear()
    const month = pad(date.getUTCMonth() + 1)
    const day = pad(date.getUTCDate())
    const hours = pad(date.getUTCHours())
    const minutes = pad(date.getUTCMinutes())
    const seconds = pad(date.getUTCSeconds())
    return fmt.replace('YYYY', year.toString()).replace('MM', month).replace('DD', day).replace('HH', hours).replace('mm', minutes).replace('ss', seconds)
  }
  const $ = (selector, root = document) => root == null ? void 0 : root.querySelector(selector)
  const $$ = (selector, root = document) => Array.from((root == null ? void 0 : root.querySelectorAll(selector)) || [])
  const downBtn = `
<svg viewBox="0 0 24 24" style="width: 18px; height: 18px;"><g class="download"><path d="M3,14 v5 q0,2 2,2 h14 q2,0 2,-2 v-5 M7,10 l4,4 q1,1 2,0 l4,-4 M12,3 v11" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" /></g>
<g class="completed"><path d="M3,14 v5 q0,2 2,2 h14 q2,0 2,-2 v-5 M7,10 l3,4 q1,1 2,0 l8,-11" fill="none" stroke="#1DA1F2" stroke-width="2" stroke-linecap="round" /></g>
<g class="loading"><circle cx="12" cy="12" r="10" fill="none" stroke="#1DA1F2" stroke-width="4" opacity="0.4" /><path d="M12,2 a10,10 0 0 1 10,10" fill="none" stroke="#1DA1F2" stroke-width="4" stroke-linecap="round" /></g>
<g class="failed"><circle cx="12" cy="12" r="11" fill="#f33" stroke="currentColor" stroke-width="2" opacity="0.8" /><path d="M14,5 a1,1 0 0 0 -4,0 l0.5,9.5 a1.5,1.5 0 0 0 3,0 z M12,17 a2,2 0 0 0 0,4 a2,2 0 0 0 0,-4" fill="#fff" stroke="none" /></g></svg>
`
  function detect(node) {
    if (!node)
      return
    const isArticle = node.tagName === 'ARTICLE' || node.tagName === 'DIV'
    const article = isArticle ? $('article', node) || node.closest('article') : null
    if (article)
      addButtonToImgs(article)
    const isListItems = node.tagName === 'LI' && node.getAttribute('role') === 'listitem' && [node] || node.tagName === 'DIV'
    const listitems = isListItems ? $$('li[role="listitem"]', node) : null
    listitems == null ? void 0 : listitems.forEach(item => addButtonToMediaList(item))
  }
  function createDownBtn() {
    const btn_down = document.createElement('div')
    btn_down.innerHTML = `<div><div>${downBtn}</div></div>`
    return btn_down
  }
  function addButtonToImgs(article) {
    if (article.dataset.detected)
      return
    article.dataset.detected = 'true'
    const media_selector = [
      'a[href*="/photo/1"]',
      'div[role="progressbar"]',
      'div[data-testid="playButton"]',
      'a[href="/settings/content_you_see"]',
      // hidden content
      'div.media-image-container',
      // for tweetdeck
      'div.media-preview-container',
      // for tweetdeck
      'div[aria-labelledby]>div:first-child>div[role="button"][tabindex="0"]',
      // for audio (experimental)
    ]
    const media = $(media_selector.join(','), article)
    if (!media)
      return
    const status_item = $('a[href*="/status/"]', article)
    if (!status_item)
      return
    const status_id = getStatusId(status_item)
    if (!status_id)
      return
    const btn_group = $('div[role="group"]:last-of-type, ul.tweet-actions, ul.tweet-detail-actions', article)
    const btn_share = $$(':scope>div>div, li.tweet-action-item>a, li.tweet-detail-action-item>a', btn_group).pop().parentNode
    const btn_down = btn_share.cloneNode(true)
    $('svg', btn_down).innerHTML = downBtn
    const is_exist = idHistory.includes(status_id)
    const title = is_exist ? 'completed' : 'download'
    set_status(btn_down, 'tmd-down')
    set_status(btn_down, title, title)
    btn_group == null ? void 0 : btn_group.insertBefore(btn_down, btn_share.nextSibling)
    btn_down.onclick = () => click(btn_down, status_id, is_exist)
    const imgs = $$('a[href*="/photo/"]', article)
    if (imgs.length < 1)
      return
    imgs.forEach((img) => {
      let _a, _b
      const index = Number((_a = img.href.split('/status/').pop()) == null ? void 0 : _a.split('/').pop()) || 0
      const is_exist2 = idHistory.includes(status_id)
      const btn_down2 = createDownBtn()
      btn_down2.classList.add('tmd-down', 'tmd-img')
      btn_down2.onclick = (e) => {
        e.preventDefault()
        click(btn_down2, status_id, is_exist2, index)
      };
      (_b = img.parentNode) == null ? void 0 : _b.appendChild(btn_down2)
      set_status(btn_down2, 'download')
    })
  }
  function getStatusId(item) {
    let _a
    const status_item = $('a[href*="/status/"]', item)
    if (!status_item)
      return ''
    const status_id = (_a = status_item.href.split('/status/').pop()) == null ? void 0 : _a.split('/').shift()
    return status_id || ''
  }
  function addButtonToMediaList(item) {
    if (item.dataset.detected)
      return
    item.dataset.detected = 'true'
    const status_id = getStatusId(item)
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
  async function click(btn, status_id, is_exist, index) {
    if (btn.classList.contains('loading'))
      return
    set_status(btn, 'loading')
    const out = `{date-time}-{status-id}`
    const json = await fetchTweet(status_id)
    const tweet = json.legacy
    const user = json.core.user_results.result.legacy
    const info = {}
    info['status-id'] = status_id
    info['user-name'] = user.name
    info['user-id'] = user.screen_name
    info['date-time'] = formatDate(tweet.created_at)
    let medias = tweet.extended_entities && tweet.extended_entities.media
    if (index)
      medias = [medias[index - 1]]
    if (medias.length < 1) {
      set_status(btn, 'failed', 'MEDIA_NOT_FOUND')
      return
    }
    let tasks = medias.length
    const tasks_result = []
    medias.forEach((media, i) => {
      let _a
      info.url = media.type === 'photo' ? `${media.media_url_https.replace('jpg', 'png')}:large` : media.video_info.variants.filter(n => n.content_type === 'video/mp4').sort((a, b) => b.bitrate - a.bitrate)[0].url
      info.file = ((_a = info.url.split('/').pop()) == null ? void 0 : _a.split(/[:?]/).shift()) || 'media'
      info['file-name'] = info.file.split('.').shift() || 'media'
      info['file-ext'] = info.file.split('.').pop() || 'jpg'
      info['file-type'] = media.type.replace('animated_', '') || 'photo'
      const baseOut = out.replace(/\.?\{file-ext\}/, '')
      const shouldAppendIndex = (medias.length > 1 || index) && out.match('{file-name}')
      const indexSuffix = shouldAppendIndex ? `-${index ? index - 1 : i}` : ''
      const formattedOut = `${baseOut}${indexSuffix}.{file-ext}`
      info.out = formattedOut.replace(/\{([^{}:]+)(:[^{}]+)?\}/g, (_match, name) => info[name])
      downloader.add({
        url: info.url,
        name: info.out,
        onload: async () => {
          tasks -= 1
          tasks_result.push(medias.length > 1 || index ? `${index || i + 1}: ` : '')
          set_status(btn, void 0, tasks_result.sort().join('\n'))
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
  function set_status(btn, className, title) {
    if (className) {
      btn.classList.remove('download', 'completed', 'loading', 'failed')
      btn.classList.add(className)
    }
    if (title)
      btn.title = title
  }
  function main() {
    useHistory()
    const observer = new MutationObserver(
      ms => ms.forEach(m => m.addedNodes.forEach(node => detect(node))),
    )
    observer.observe(document.body, { childList: true, subtree: true })
    document.head.insertAdjacentHTML('beforeend', `<style>
.tmd-down {margin-left: 12px; order: 99;}
.tmd-down:hover > div > div > div > div {color: rgba(29, 161, 242, 1.0);}
.tmd-down:hover > div > div > div > div > div {background-color: rgba(29, 161, 242, 0.1);}
.tmd-down:active > div > div > div > div > div {background-color: rgba(29, 161, 242, 0.2);}
.tmd-down:hover svg {color: rgba(29, 161, 242, 1.0);}
.tmd-down:hover div:first-child:not(:last-child) {background-color: rgba(29, 161, 242, 0.1);}
.tmd-down:active div:first-child:not(:last-child) {background-color: rgba(29, 161, 242, 0.2);}
.tmd-down.tmd-media {position: absolute; right: 0;}
.tmd-down.tmd-media > div {display: flex; border-radius: 99px; margin: 2px;}
.tmd-down.tmd-media > div > div {display: flex; margin: 6px; color: #fff;}
.tmd-down.tmd-media:hover > div {background-color: rgba(255,255,255, 0.6);}
.tmd-down.tmd-media:hover > div > div {color: rgba(29, 161, 242, 1.0);}
.tmd-down.tmd-media:not(:hover) > div > div {filter: drop-shadow(0 0 1px #000);}
.tmd-down g {display: none;}
.tmd-down.download g.download, .tmd-down.completed g.completed, .tmd-down.loading g.loading,.tmd-down.failed g.failed {display: unset;}
.tmd-down.loading svg {animation: spin 1s linear infinite;}
@keyframes spin {0% {transform: rotate(0deg);} 100% {transform: rotate(360deg);}}
.tmd-btn {display: inline-block; background-color: #1DA1F2; color: #FFFFFF; padding: 0 20px; border-radius: 99px;}
.tmd-tag {display: inline-block; background-color: #FFFFFF; color: #1DA1F2; padding: 0 10px; border-radius: 10px; border: 1px solid #1DA1F2;  font-weight: bold; margin: 5px;}
.tmd-btn:hover {background-color: rgba(29, 161, 242, 0.9);}
.tmd-tag:hover {background-color: rgba(29, 161, 242, 0.1);}
.tmd-notifier {display: none; position: fixed; left: 16px; bottom: 16px; color: #000; background: #fff; border: 1px solid #ccc; border-radius: 8px; padding: 4px;}
.tmd-notifier.running {display: flex; align-items: center;}
.tmd-notifier label {display: inline-flex; align-items: center; margin: 0 8px;}
.tmd-notifier label:before {content: " "; width: 32px; height: 16px; background-position: center; background-repeat: no-repeat;}
.tmd-notifier label:nth-child(1):before {background-image:url("data:image/svg+xml;charset=utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2216%22 height=%2216%22 viewBox=%220 0 24 24%22><path d=%22M3,14 v5 q0,2 2,2 h14 q2,0 2,-2 v-5 M7,10 l4,4 q1,1 2,0 l4,-4 M12,3 v11%22 fill=%22none%22 stroke=%22%23666%22 stroke-width=%222%22 stroke-linecap=%22round%22 /></svg>");}
.tmd-notifier label:nth-child(2):before {background-image:url("data:image/svg+xml;charset=utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2216%22 height=%2216%22 viewBox=%220 0 24 24%22><path d=%22M12,2 a1,1 0 0 1 0,20 a1,1 0 0 1 0,-20 M12,5 v7 h6%22 fill=%22none%22 stroke=%22%23999%22 stroke-width=%222%22 stroke-linejoin=%22round%22 stroke-linecap=%22round%22 /></svg>");}
.tmd-notifier label:nth-child(3):before {background-image:url("data:image/svg+xml;charset=utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2216%22 height=%2216%22 viewBox=%220 0 24 24%22><path d=%22M12,0 a2,2 0 0 0 0,24 a2,2 0 0 0 0,-24%22 fill=%22%23f66%22 stroke=%22none%22 /><path d=%22M14.5,5 a1,1 0 0 0 -5,0 l0.5,9 a1,1 0 0 0 4,0 z M12,17 a2,2 0 0 0 0,5 a2,2 0 0 0 0,-5%22 fill=%22%23fff%22 stroke=%22none%22 /></svg>");}
.tmd-down.tmd-img {position: absolute; right: 0; bottom: 0; display: none !important;}
.tmd-down.tmd-img > div {display: flex; border-radius: 99px; margin: 2px; background-color: rgba(255,255,255, 0.6);}
.tmd-down.tmd-img > div > div {display: flex; margin: 6px; color: #fff !important;}
.tmd-down.tmd-img:not(:hover) > div > div {filter: drop-shadow(0 0 1px #000);}
.tmd-down.tmd-img:hover > div > div {color: rgba(29, 161, 242, 1.0);}
:hover > .tmd-down.tmd-img, .tmd-img.loading, .tmd-img.completed, .tmd-img.failed {display: block !important;}
.tweet-detail-action-item {width: 20% !important;}
</style>`)
  }
  window.onload = async function () {
    main()
    console.debug('twitter media downloader loaded.')
  }
})()
