// ==UserScript==
// @name        Twitter Media Downloader
// @name:ja     Twitter Media Downloader
// @name:zh-cn  Twitter 媒体下载
// @name:zh-tw  Twitter 媒體下載
// @description    Save Video/Photo by One-Click.
// @description:ja ワンクリックで動画・画像を保存する。
// @description:zh-cn 一键保存视频/图片
// @description:zh-tw 一鍵保存視頻/圖片
// @version     1.28
// @author      AMANE
// @namespace   none
// @match       https://twitter.com/*
// @match       https://mobile.twitter.com/*
// @grant       GM_registerMenuCommand
// @grant       GM_setValue
// @grant       GM_getValue
// @grant       GM_download
// @license     MIT
// @downloadURL https://update.greasyfork.org/scripts/423001/Twitter%20Media%20Downloader.user.js
// @updateURL https://update.greasyfork.org/scripts/423001/Twitter%20Media%20Downloader.meta.js
// ==/UserScript==
/* jshint esversion: 8 */

const filename = 'twitter_{user-name}(@{user-id})_{date-time}_{status-id}_{file-type}'

const language = {
  'en': {
    download: 'Download',
    completed: 'Download Completed',
    settings: 'Settings',
    dialog: {
      title: 'Download Settings',
      save: 'Save',
      save_history: 'Remember download history',
      clear_history: '(Clear)',
      clear_confirm: 'Clear download history?',
      show_sensitive: 'Always show sensitive content',
      pattern: 'File Name Pattern',
    },
  },

  'ja': {
    download: 'ダウンロード',
    completed: 'ダウンロード完了',
    settings: '設定',
    dialog: {
      title: 'ダウンロード設定',
      save: '保存',
      save_history: 'ダウンロード履歴を保存する',
      clear_history: '(クリア)',
      clear_confirm: 'ダウンロード履歴を削除する？',
      show_sensitive: 'センシティブな内容を常に表示する',
      pattern: 'ファイル名パターン',
    },
  },

  'zh': {
    download: '下载',
    completed: '下载完成',
    settings: '设置',
    dialog: {
      title: '下载设置',
      save: '保存',
      save_history: '保存下载记录',
      clear_history: '(清除)',
      clear_confirm: '确认要清除下载记录？',
      show_sensitive: '自动显示敏感的内容',
      pattern: '文件名格式',
    },
  },

  'zh-Hant': {
    download: '下載',
    completed: '下載完成',
    settings: '設置',
    dialog: {
      title: '下載設置',
      save: '保存',
      save_history: '保存下載記錄',
      clear_history: '(清除)',
      clear_confirm: '確認要清除下載記錄？',
      show_sensitive: '自動顯示敏感的内容',
      pattern: '文件名規則',
    },
  },
}

const css = `
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
`
const css_ss = `
/* show sensitive in media tab */
li[role="listitem"]>div>div>div>div:not(:last-child) {filter: none;}
li[role="listitem"]>div>div>div>div+div:last-child {display: none;}
`
const svg = `
<g class="download"><path d="M3,14 v5 q0,2 2,2 h14 q2,0 2,-2 v-5 M7,10 l4,4 q1,1 2,0 l4,-4 M12,3 v11" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" /></g>
<g class="completed"><path d="M3,14 v5 q0,2 2,2 h14 q2,0 2,-2 v-5 M7,10 l3,4 q1,1 2,0 l8,-11" fill="none" stroke="#1DA1F2" stroke-width="2" stroke-linecap="round" /></g>
<g class="loading"><circle cx="12" cy="12" r="10" fill="none" stroke="#1DA1F2" stroke-width="4" opacity="0.4" /><path d="M12,2 a10,10 0 0 1 10,10" fill="none" stroke="#1DA1F2" stroke-width="4" stroke-linecap="round" /></g>
<g class="failed"><circle cx="12" cy="12" r="11" fill="#f33" stroke="currentColor" stroke-width="2" opacity="0.8" /><path d="M14,5 a1,1 0 0 0 -4,0 l0.5,9.5 a1.5,1.5 0 0 0 3,0 z M12,17 a2,2 0 0 0 0,4 a2,2 0 0 0 0,-4" fill="#fff" stroke="none" /></g>
`

let lang, host, history, show_sensitive, is_tweetdeck

function detect(node) {
  if (!node)
    return

  const article = node.tagName === 'ARTICLE' || node.tagName === 'DIV' && (node.querySelector('article') || node.closest('article'))

  if (article)
    addButtonTo(article)

  const listitems = node.tagName === 'LI' && node.getAttribute('role') === 'listitem' && [node] || node.tagName === 'DIV' && node.querySelectorAll('li[role="listitem"]')

  if (listitems)
    addButtonToMedia(listitems)
}

function addButtonTo(article) {
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
  const media = article.querySelector(media_selector.join(','))
  if (!media)
    return

  const status_item = article.querySelector('a[href*="/status/"]')
  if (!status_item)
    return

  const status_id = status_item.href.split('/status/').pop().split('/').shift()

  const btn_group = article.querySelector('div[role="group"]:last-of-type, ul.tweet-actions, ul.tweet-detail-actions')
  const btn_share = Array.from(btn_group.querySelectorAll(':scope>div>div, li.tweet-action-item>a, li.tweet-detail-action-item>a')).pop().parentNode
  const btn_down = btn_share.cloneNode(true)
  if (is_tweetdeck) {
    btn_down.firstElementChild.innerHTML = `<svg viewBox="0 0 24 24" style="width: 18px; height: 18px;">${svg}</svg>`
    btn_down.firstElementChild.removeAttribute('rel')
    btn_down.classList.replace('pull-left', 'pull-right')
  }
  else {
    btn_down.querySelector('svg').innerHTML = svg
  }
  const is_exist = history.includes(status_id)
  set_status(btn_down, 'tmd-down')
  set_status(btn_down, is_exist ? 'completed' : 'download', is_exist ? lang.completed : lang.download)
  btn_group.insertBefore(btn_down, btn_share.nextSibling)
  btn_down.onclick = () => click(btn_down, status_id, is_exist)
  if (show_sensitive) {
    const btn_show = article.querySelector('div[aria-labelledby] div[role="button"][tabindex="0"]:not([data-testid]) > div[dir] > span > span')
    if (btn_show)
      btn_show.click()
  }

  const imgs = article.querySelectorAll('a[href*="/photo/"]')
  if (imgs.length < 1)
    return
  imgs.forEach((img) => {
    const index = img.href.split('/status/').pop().split('/').pop()
    const is_exist = history.includes(status_id)
    const btn_down = document.createElement('div')
    btn_down.innerHTML = `<div><div><svg viewBox="0 0 24 24" style="width: 18px; height: 18px;">${svg}</svg></div></div>`
    btn_down.classList.add('tmd-down', 'tmd-img')
    set_status(btn_down, 'download')
    img.parentNode.appendChild(btn_down)
    btn_down.onclick = (e) => {
      e.preventDefault()
      click(btn_down, status_id, is_exist, index)
    }
  })
}

function addButtonToMedia(listitems) {
  listitems.forEach((li) => {
    if (li.dataset.detected)
      return
    li.dataset.detected = 'true'

    const status_item = li.querySelector('a[href*="/status/"]')
    if (!status_item)
      return

    const status_id = status_item.href.split('/status/').pop().split('/').shift()
    const is_exist = history.includes(status_id)
    const btn_down = document.createElement('div')
    btn_down.innerHTML = `<div><div><svg viewBox="0 0 24 24" style="width: 18px; height: 18px;">${svg}</svg></div></div>`
    btn_down.classList.add('tmd-down', 'tmd-media')
    set_status(btn_down, is_exist ? 'completed' : 'download', is_exist ? lang.completed : lang.download)
    li.appendChild(btn_down)
    btn_down.onclick = () => click(btn_down, status_id, is_exist)
  })
}

async function click(btn, status_id, is_exist, index) {
  if (btn.classList.contains('loading'))
    return
  set_status(btn, 'loading')
  const out = (await GM_getValue('filename', filename)).split('\n').join('')
  const save_history = await GM_getValue('save_history', true)
  const json = await fetchJson(status_id)
  const tweet = json.legacy
  const user = json.core.user_results.result.legacy
  const invalid_chars = { '\\': '＼', '\/': '／', '\|': '｜', '<': '＜', '>': '＞', ':': '：', '*': '＊', '?': '？', '"': '＂', '\u200B': '', '\u200C': '', '\u200D': '', '\u2060': '', '\uFEFF': '', '🔞': '' }
  const datetime = out.match(/{date-time(-local)?:[^{}]+}/) ? out.match(/{date-time(?:-local)?:([^{}]+)}/)[1].replace(/[\\/|<>*?:"]/g, v => invalid_chars[v]) : 'YYYYMMDD-hhmmss'
  const info = {}
  info['status-id'] = status_id
  info['user-name'] = user.name.replace(/([\\/|*?:"]|[\u200B-\u200D\u2060\uFEFF]|🔞)/g, v => invalid_chars[v])
  info['user-id'] = user.screen_name
  info['date-time'] = formatDate(tweet.created_at, datetime)
  info['date-time-local'] = formatDate(tweet.created_at, datetime, true)
  info['full-text'] = tweet.full_text
    .split('\n').join(' ')
    .replace(/\s*https:\/\/t\.co\/\w+/g, '')
    .replace(/[\\/|<>*?:"]|[\u200B-\u200D\u2060\uFEFF]/g, v => invalid_chars[v])

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
    info.url = media.type === 'photo' ? `${media.media_url_https}:orig` : media.video_info.variants.filter(n => n.content_type === 'video/mp4').sort((a, b) => b.bitrate - a.bitrate)[0].url
    info.file = info.url.split('/').pop().split(/[:?]/).shift()
    info['file-name'] = info.file.split('.').shift()
    info['file-ext'] = info.file.split('.').pop()
    info['file-type'] = media.type.replace('animated_', '')

    info.out = (`${out.replace(/\.?{file-ext}/, '') + ((medias.length > 1 || index) && out.match('{file-name}') ? '' : `-${index ? index - 1 : i}`)}.{file-ext}`)
      .replace(/{([^{}:]+)(:[^{}]+)?}/g, (match, name) => info[name])

    downloader().add({
      url: info.url,
      name: info.out,
      onload: () => {
        tasks -= 1
        tasks_result.push(((medias.length > 1 || index) ? `${index || i + 1}: ` : '') + lang.completed)
        set_status(btn, null, tasks_result.sort().join('\n'))
        if (tasks === 0) {
          set_status(btn, 'completed', lang.completed)
          if (save_history && !is_exist) {
            history.push(status_id)
            storage(status_id)
          }
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

function set_status(btn, css, title, style) {
  if (css) {
    btn.classList.remove('download', 'completed', 'loading', 'failed')
    btn.classList.add(css)
  }
  if (title)
    btn.title = title
  if (style)
    btn.style.cssText = style
}

async function settings() {
  const $element = (parent, tag, style, content, css) => {
    const el = document.createElement(tag)
    if (style)
      el.style.cssText = style
    if (typeof content !== 'undefined') {
      if (tag === 'input') {
        if (content === 'checkbox')
          el.type = content
        else el.value = content
      }
      else {
        el.innerHTML = content
      }
    }
    if (css)
      css.split(' ').forEach(c => el.classList.add(c))
    parent.appendChild(el)
    return el
  }

  const wapper = $element(document.body, 'div', 'position: fixed; left: 0px; top: 0px; width: 100%; height: 100%; background-color: #0009; z-index: 10;')
  let wapper_close
  wapper.onmousedown = (e) => {
    wapper_close = e.target === wapper
  }
  wapper.onmouseup = (e) => {
    if (wapper_close && e.target === wapper)
      wapper.remove()
  }
  const dialog = $element(wapper, 'div', 'position: absolute; left: 50%; top: 50%; transform: translateX(-50%) translateY(-50%); width: fit-content; width: -moz-fit-content; background-color: #f3f3f3; border: 1px solid #ccc; border-radius: 10px; color: black;')
  const title = $element(dialog, 'h3', 'margin: 10px 20px;', lang.dialog.title)
  const options = $element(dialog, 'div', 'margin: 10px; border: 1px solid #ccc; border-radius: 5px;')
  const save_history_label = $element(options, 'label', 'display: block; margin: 10px;', lang.dialog.save_history)
  const save_history_input = $element(save_history_label, 'input', 'float: left;', 'checkbox')
  save_history_input.checked = await GM_getValue('save_history', true)
  save_history_input.onchange = () => {
    GM_setValue('save_history', save_history_input.checked)
  }
  const clear_history = $element(save_history_label, 'label', 'display: inline-block; margin: 0 10px; color: blue;', lang.dialog.clear_history)
  clear_history.onclick = () => {
    if (confirm(lang.dialog.clear_confirm)) {
      history = []
      GM_setValue('download_history', [])
    }
  }
  const show_sensitive_label = $element(options, 'label', 'display: block; margin: 10px;', lang.dialog.show_sensitive)
  const show_sensitive_input = $element(show_sensitive_label, 'input', 'float: left;', 'checkbox')
  show_sensitive_input.checked = await GM_getValue('show_sensitive', false)
  show_sensitive_input.onchange = () => {
    show_sensitive = show_sensitive_input.checked
    GM_setValue('show_sensitive', show_sensitive)
  }
  const filename_div = $element(dialog, 'div', 'margin: 10px; border: 1px solid #ccc; border-radius: 5px;')
  const filename_label = $element(filename_div, 'label', 'display: block; margin: 10px 15px;', lang.dialog.pattern)
  const filename_input = $element(filename_label, 'textarea', 'display: block; min-width: 500px; max-width: 500px; min-height: 100px; font-size: inherit; background: white; color: black;', await GM_getValue('filename', filename))
  const filename_tags = $element(filename_div, 'label', 'display: table; margin: 10px;', `
<span class="tmd-tag" title="user name">{user-name}</span>
<span class="tmd-tag" title="The user name after @ sign.">{user-id}</span>
<span class="tmd-tag" title="example: 1234567890987654321">{status-id}</span>
<span class="tmd-tag" title="{date-time} : Posted time in UTC.\n{date-time-local} : Your local time zone.\n\nDefault:\nYYYYMMDD-hhmmss => 20201231-235959\n\nExample of custom:\n{date-time:DD-MMM-YY hh.mm} => 31-DEC-21 23.59">{date-time}</span><br>
<span class="tmd-tag" title="Text content in tweet.">{full-text}</span>
<span class="tmd-tag" title="Type of &#34;video&#34; or &#34;photo&#34; or &#34;gif&#34;.">{file-type}</span>
<span class="tmd-tag" title="Original filename from URL.">{file-name}</span>
`)

  filename_input.selectionStart = filename_input.value.length
  filename_tags.querySelectorAll('.tmd-tag').forEach((tag) => {
    tag.onclick = () => {
      const ss = filename_input.selectionStart
      const se = filename_input.selectionEnd
      filename_input.value = filename_input.value.substring(0, ss) + tag.textContent + filename_input.value.substring(se)
      filename_input.selectionStart = ss + tag.textContent.length
      filename_input.selectionEnd = ss + tag.textContent.length
      filename_input.focus()
    }
  })
  const btn_save = $element(title, 'label', 'float: right;', lang.dialog.save, 'tmd-btn')
  btn_save.onclick = async () => {
    await GM_setValue('filename', filename_input.value)
    wapper.remove()
  }
}

async function fetchJson(status_id) {
  const base_url = `https://${host}/i/api/graphql/NmCeCgkVlsRGS1cAwqtgmw/TweetDetail`
  const variables = {
    focalTweetId: status_id,
    with_rux_injections: false,
    includePromotedContent: true,
    withCommunity: true,
    withQuickPromoteEligibilityTweetFields: true,
    withBirdwatchNotes: true,
    withVoice: true,
    withV2Timeline: true,
  }
  const features = {
    rweb_lists_timeline_redesign_enabled: true,
    responsive_web_graphql_exclude_directive_enabled: true,
    verified_phone_label_enabled: false,
    creator_subscriptions_tweet_preview_api_enabled: true,
    responsive_web_graphql_timeline_navigation_enabled: true,
    responsive_web_graphql_skip_user_profile_image_extensions_enabled: false,
    tweetypie_unmention_optimization_enabled: true,
    responsive_web_edit_tweet_api_enabled: true,
    graphql_is_translatable_rweb_tweet_is_translatable_enabled: true,
    view_counts_everywhere_api_enabled: true,
    longform_notetweets_consumption_enabled: true,
    responsive_web_twitter_article_tweet_consumption_enabled: false,
    tweet_awards_web_tipping_enabled: false,
    freedom_of_speech_not_reach_fetch_enabled: true,
    standardized_nudges_misinfo: true,
    tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled: true,
    longform_notetweets_rich_text_read_enabled: true,
    longform_notetweets_inline_media_enabled: true,
    responsive_web_media_download_video_enabled: false,
    responsive_web_enhance_cards_enabled: false,
  }
  const url = encodeURI(`${base_url}?variables=${JSON.stringify(variables)}&features=${JSON.stringify(features)}`)
  const cookies = getCookie()
  const headers = {
    'authorization': 'Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA',
    'x-twitter-active-user': 'yes',
    'x-twitter-client-language': cookies.lang,
    'x-csrf-token': cookies.ct0,
  }
  if (cookies.ct0.length === 32)
    headers['x-guest-token'] = cookies.gt
  const tweet_detail = await fetch(url, { headers }).then(result => result.json())
  const tweet_entrie = tweet_detail.data.threaded_conversation_with_injections_v2.instructions[0].entries.find(n => n.entryId === `tweet-${status_id}`)
  const tweet_result = tweet_entrie.content.itemContent.tweet_results.result
  return tweet_result.tweet || tweet_result
}

function getCookie(name) {
  const cookies = {}
  document.cookie.split(';').filter(n => n.indexOf('=') > 0).forEach((n) => {
    n.replace(/^([^=]+)=(.+)$/, (match, name, value) => {
      cookies[name.trim()] = value.trim()
    })
  })
  return name ? cookies[name] : cookies
}

async function storage(value) {
  let data = await GM_getValue('download_history', [])
  const data_length = data.length
  if (value) {
    if (Array.isArray(value))
      data = data.concat(value)
    else if (!data.includes(value))
      data.push(value)
  }
  else { return data }
  if (data.length > data_length)
    GM_setValue('download_history', data)
}

function storage_obsolete(is_remove) {
  const data = JSON.parse(localStorage.getItem('history') || '[]')
  if (is_remove)
    localStorage.removeItem('history')
  else return data
}

function formatDate(i, o, tz) {
  const d = new Date(i)
  if (tz)
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  const m = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
  const v = {
    YYYY: d.getUTCFullYear().toString(),
    YY: d.getUTCFullYear().toString(),
    MM: d.getUTCMonth() + 1,
    MMM: m[d.getUTCMonth()],
    DD: d.getUTCDate(),
    hh: d.getUTCHours(),
    mm: d.getUTCMinutes(),
    ss: d.getUTCSeconds(),
    h2: d.getUTCHours() % 12,
    ap: d.getUTCHours() < 12 ? 'AM' : 'PM',
  }
  return o.replace(/(YY(YY)?|MMM?|DD|hh|mm|ss|h2|ap)/g, n => (`0${v[n]}`).substr(-n.length))
}

function downloader() {
  const tasks = []
  let thread = 0
  let max_thread = 2
  let retry_times = 0
  const max_retry = 2
  let failed = 0
  let notifier
  let has_failed = false

  function add(task) {
    tasks.push(task)
    if (thread < max_thread) {
      thread += 1
      next()
    }
    else { update() }
  }
  async function next() {
    const task = tasks.shift()
    await start(task)
    if (tasks.length > 0 && thread <= max_thread)
      next()
    else thread -= 1
    update()
  }
  function start(task) {
    update()
    return new Promise((resolve) => {
      GM_download({
        url: task.url,
        name: task.name,
        onload: () => {
          task.onload()
          resolve()
        },
        onerror: (result) => {
          retry(task, result)
          resolve()
        },
        ontimeout: (result) => {
          retry(task, result)
          resolve()
        },
      })
    })
  }
  function retry(task, result) {
    retry_times += 1
    if (retry_times === 3)
      max_thread = 1
    if (task.retry && task.retry >= max_retry
      || result.details && result.details.current === 'USER_CANCELED') {
      task.onerror(result)
      failed += 1
    }
    else {
      if (max_thread === 1)
        task.retry = (task.retry || 0) + 1
      add(task)
    }
  }
  function update() {
    if (!notifier) {
      notifier = document.createElement('div')
      notifier.title = 'Twitter Media Downloader'
      notifier.classList.add('tmd-notifier')
      notifier.innerHTML = '<label>0</label>|<label>0</label>'
      document.body.appendChild(notifier)
    }
    if (failed > 0 && !has_failed) {
      has_failed = true
      notifier.innerHTML += '|'
      const clear = document.createElement('label')
      notifier.appendChild(clear)
      clear.onclick = () => {
        notifier.innerHTML = '<label>0</label>|<label>0</label>'
        failed = 0
        has_failed = false
        update()
      }
    }
    notifier.firstChild.textContent = thread
    notifier.firstChild.nextElementSibling.textContent = tasks.length
    if (failed > 0)
      notifier.lastChild.textContent = failed
    if (thread > 0 || tasks.length > 0 || failed > 0)
      notifier.classList.add('running')
    else notifier.classList.remove('running')
  }

  return { add }
}

async function init() {
  GM_registerMenuCommand((language[navigator.language] || language.en).settings, settings)
  lang = language[document.querySelector('html').lang] || language.en
  host = location.hostname
  is_tweetdeck = host.includes('tweetdeck')
  history = storage_obsolete()
  if (history.length) {
    storage(history)
    storage_obsolete(true)
  }
  else {
    history = await storage()
  }

  show_sensitive = GM_getValue('show_sensitive', false)
  document.head.insertAdjacentHTML('beforeend', `<style>${css}${show_sensitive ? css_ss : ''}</style>`)
  const observer = new MutationObserver(ms =>
    ms.forEach(m => m.addedNodes.forEach(node => detect(node))),
  )
  observer.observe(document.body, { childList: true, subtree: true })
}

window.onload = async function () {
  await init()
  console.log('twitter media downloader loaded.')
}
