// ==UserScript==
// @name         推特小工具
// @namespace    chilfish/monkey
// @version      2024.10.08
// @author       monkey
// @description  推特小工具
// @icon         https://abs.twimg.com/favicons/twitter.ico
// @downloadURL  https://github.com/Chilfish/Scripts/raw/main/monkey/twitter-utils.user.js
// @updateURL    https://github.com/Chilfish/Scripts/raw/main/monkey/meta/twitter-utils.meta.js
// @match        https://twitter.com/*
// @match        https://x.com/*
// @grant        GM_addStyle
// @grant        GM_deleteValue
// @grant        GM_download
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        unsafeWindow
// @run-at       document-start
// ==/UserScript==

(function () {
  'use strict'

  const __defProp = Object.defineProperty
  const __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value
  const __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== 'symbol' ? `${key}` : key, value)
  const _GM_addStyle = /* @__PURE__ */ (() => typeof GM_addStyle != 'undefined' ? GM_addStyle : void 0)()
  const _GM_deleteValue = /* @__PURE__ */ (() => typeof GM_deleteValue != 'undefined' ? GM_deleteValue : void 0)()
  const _GM_download = /* @__PURE__ */ (() => typeof GM_download != 'undefined' ? GM_download : void 0)()
  const _GM_getValue = /* @__PURE__ */ (() => typeof GM_getValue != 'undefined' ? GM_getValue : void 0)()
  const _GM_setValue = /* @__PURE__ */ (() => typeof GM_setValue != 'undefined' ? GM_setValue : void 0)()
  const _unsafeWindow = /* @__PURE__ */ (() => typeof unsafeWindow != 'undefined' ? unsafeWindow : void 0)()
  const appname = '[twitter-utils]'
  const logger = {
    info: console.info,
    warn: console.warn,
    error: console.error,
    errorWithBanner: (msg, err, ...args) => {
      console.error(appname, msg, (err == null ? void 0 : err.message) ?? 'none', ...args)
    },
    debug: console.debug,
  }
  const globalObject = _unsafeWindow ?? window ?? globalThis
  const xhrOpen = globalObject.XMLHttpRequest.prototype.open
  class ExtensionManager {
    constructor() {
      __publicField(this, 'extensions', /* @__PURE__ */ new Map())
      __publicField(this, 'disabledExtensions', /* @__PURE__ */ new Set())
      this.installHttpHooks()
    }

    /**
     * Register and instantiate a new extension.
     *
     * @param Ctor Extension constructor.
     */
    add(Ctor) {
      try {
        logger.debug(`Register new extension: ${Ctor.name}`)
        const instance = new Ctor(this)
        this.extensions.set(instance.name, instance)
      }
      catch (err) {
        logger.error(`Failed to register extension: ${Ctor.name}`, err)
      }
    }

    /**
     * Set up all enabled extensions.
     */
    start() {
      for (const ext of this.extensions.values()) {
        if (this.disabledExtensions.has(ext.name)) {
          this.disable(ext.name)
        }
        else {
          this.enable(ext.name)
        }
      }
    }

    enable(name) {
      try {
        this.disabledExtensions.delete(name)
        const ext = this.extensions.get(name)
        ext.enabled = true
        ext.setup()
        logger.debug(`Enabled extension: ${name}`)
      }
      catch (err) {
        logger.error(`Failed to enable extension: ${name}`, err)
      }
    }

    disable(name) {
      try {
        this.disabledExtensions.add(name)
        const ext = this.extensions.get(name)
        ext.enabled = false
        ext.dispose()
        logger.debug(`Disabled extension: ${name}`)
      }
      catch (err) {
        logger.error(`Failed to disable extension: ${name}`, err)
      }
    }

    getExtensions() {
      return [...this.extensions.values()]
    }

    /**
     * Here we hooks the browser's XHR method to intercept Twitter's Web API calls.
     * This need to be done before any XHR request is made.
     */
    installHttpHooks() {
      const manager = this
      globalObject.XMLHttpRequest.prototype.open = function (method, url) {
        const xhr = this
        xhr.addEventListener('load', () => {
          manager.getExtensions().filter(ext => ext.enabled).forEach((ext) => {
            const func = ext.intercept()
            if (func) {
              func({ method, url }, xhr, ext)
            }
          })
        })
        xhrOpen.apply(this, arguments)
      }
      logger.info('Hooked into XMLHttpRequest')
      setTimeout(() => {
        if (!('webpackChunk_twitter_responsive_web' in globalObject)) {
          logger.error(
            'Error: Wrong execution context detected.\n  This script needs to be injected into "page" context rather than "content" context.\n  The XMLHttpRequest hook will not work properly.\n  See: https://github.com/prinsss/twitter-web-exporter/issues/19',
          )
        }
      }, 1e3)
    }
  }
  var ExtensionType = /* @__PURE__ */ ((ExtensionType2) => {
    ExtensionType2.TWEET = 'tweet'
    ExtensionType2.USER = 'user'
    ExtensionType2.NONE = 'none'
    return ExtensionType2
  })(ExtensionType || {})
  class Extension {
    constructor(manager) {
      __publicField(this, 'name', '')
      __publicField(this, 'enabled', true)
      __publicField(this, 'type', 'none')
      __publicField(this, 'manager')
      this.manager = manager
    }

    /**
     * Optionally run side effects when enabled.
     */
    setup() {
    }

    /**
     * Optionally clear side effects when disabled.
     */
    dispose() {
    }

    /**
     * Intercept HTTP responses.
     */
    intercept() {
      return null
    }
  }
  const extensionManager = new ExtensionManager()
  const $ = (selector, root = document) => root == null ? void 0 : root.querySelector(selector)
  const $$ = (selector, root = document) => Array.from((root == null ? void 0 : root.querySelectorAll(selector)) || [])
  function waitForElement(selector, options = {}) {
    const {
      root = document.body,
      timeout = 1e3 * 60,
      checkTextContent = true,
    } = options
    return new Promise((resolve) => {
      const existingElement = $(selector, root)
      if (existingElement && (!checkTextContent || existingElement.textContent)) {
        resolve(existingElement)
        return
      }
      const observer = new MutationObserver(() => {
        const element = $(selector, root)
        if (element && (!checkTextContent || element.textContent)) {
          observer.disconnect()
          resolve(element)
        }
      })
      observer.observe(root, {
        childList: true,
        subtree: true,
        attributes: true,
      })
      if (timeout > 0) {
        setTimeout(() => {
          observer.disconnect()
          console.warn(`Timeout waiting for element: ${selector}`)
          resolve(null)
        }, timeout)
      }
    })
  }
  const store = {
    get(key, fallback) {
      const data = _GM_getValue(key)
      if (!data) {
        this.set(key, fallback)
        return fallback
      }
      return data
    },
    set(key, value) {
      _GM_setValue(key, value)
    },
    remove(key) {
      _GM_deleteValue(key)
    },
  }
  const downloader = /* @__PURE__ */ (() => {
    const tasks = []
    const MAX_RETRY = 2
    const MAX_THREADS = 2
    let activeThreads = 0
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
      cookie = document && document.cookie
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
  function formatDate(time, fmt = 'YYYY-MM-DD HH:mm:ss:SSS') {
    if (typeof time === 'number' && time < 1e12)
      time *= 1e3
    const date = new Date(time)
    if (Number.isNaN(date.getTime()))
      return ''
    const pad = num => num.toString().padStart(2, '0')
    const year = date.getFullYear()
    const month = pad(date.getMonth() + 1)
    const day = pad(date.getDate())
    const hours = pad(date.getHours())
    const minutes = pad(date.getMinutes())
    const seconds = pad(date.getSeconds())
    const milliseconds = pad(date.getMilliseconds())
    return fmt.replace('YYYY', year.toString()).replace('MM', month).replace('DD', day).replace('HH', hours).replace('mm', minutes).replace('ss', seconds).replace('SSS', milliseconds)
  }
  const style$1 = '.tmd-down {\n    margin-left: 12px;\n    order: 99;\n}\n\n.tmd-down:hover>div>div>div>div {\n    color: rgba(29, 161, 242, 1.0);\n}\n\n.tmd-down:hover>div>div>div>div>div {\n    background-color: rgba(29, 161, 242, 0.1);\n}\n\n.tmd-down:active>div>div>div>div>div {\n    background-color: rgba(29, 161, 242, 0.2);\n}\n\n.tmd-down:hover svg {\n    color: rgba(29, 161, 242, 1.0);\n}\n\n.tmd-down:hover div:first-child:not(:last-child) {\n    background-color: rgba(29, 161, 242, 0.1);\n}\n\n.tmd-down:active div:first-child:not(:last-child) {\n    background-color: rgba(29, 161, 242, 0.2);\n}\n\n.tmd-down.tmd-media {\n    position: absolute;\n    right: 0;\n}\n\n.tmd-down.tmd-media>div {\n    display: flex;\n    border-radius: 99px;\n    margin: 2px;\n}\n\n.tmd-down.tmd-media>div>div {\n    display: flex;\n    margin: 6px;\n    color: #fff;\n}\n\n.tmd-down.tmd-media:hover>div {\n    background-color: rgba(255, 255, 255, 0.6);\n}\n\n.tmd-down.tmd-media:hover>div>div {\n    color: rgba(29, 161, 242, 1.0);\n}\n\n.tmd-down.tmd-media:not(:hover)>div>div {\n    filter: drop-shadow(0 0 1px #000);\n}\n\n.tmd-down g {\n    display: none;\n}\n\n.tmd-down.download g.download,\n.tmd-down.completed g.completed,\n.tmd-down.loading g.loading,\n.tmd-down.failed g.failed {\n    display: unset;\n}\n\n.tmd-down.loading svg {\n    animation: spin 1s linear infinite;\n}\n\n@keyframes spin {\n    0% {\n        transform: rotate(0deg);\n    }\n\n    100% {\n        transform: rotate(360deg);\n    }\n}\n\n.tmd-btn {\n    display: inline-block;\n    background-color: #1DA1F2;\n    color: #FFFFFF;\n    padding: 0 20px;\n    border-radius: 99px;\n}\n\n.tmd-tag {\n    display: inline-block;\n    background-color: #FFFFFF;\n    color: #1DA1F2;\n    padding: 0 10px;\n    border-radius: 10px;\n    border: 1px solid #1DA1F2;\n    font-weight: bold;\n    margin: 5px;\n}\n\n.tmd-btn:hover {\n    background-color: rgba(29, 161, 242, 0.9);\n}\n\n.tmd-tag:hover {\n    background-color: rgba(29, 161, 242, 0.1);\n}\n\n.tmd-down.tmd-img {\n    position: absolute;\n    right: 0;\n    bottom: 0;\n    display: none !important;\n}\n\n.tmd-down.tmd-img>div {\n    display: flex;\n    border-radius: 99px;\n    margin: 2px;\n    background-color: rgba(255, 255, 255, 0.6);\n}\n\n.tmd-down.tmd-img>div>div {\n    display: flex;\n    margin: 6px;\n    color: #fff !important;\n}\n\n.tmd-down.tmd-img:not(:hover)>div>div {\n    filter: drop-shadow(0 0 1px #000);\n}\n\n.tmd-down.tmd-img:hover>div>div {\n    color: rgba(29, 161, 242, 1.0);\n}\n\n:hover>.tmd-down.tmd-img,\n.tmd-img.loading,\n.tmd-img.completed,\n.tmd-img.failed {\n    display: block !important;\n}\n\n.tweet-detail-action-item {\n    width: 20% !important;\n}'
  async function fetchTweet(status_id) {
    const base_url = `https://${location.hostname}/i/api/graphql/NmCeCgkVlsRGS1cAwqtgmw/TweetDetail`
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
  const historyKey = 'download_history'
  const idHistory = store.get(historyKey, [])
  function useHistory(value) {
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
    const regex = /\/status\/(\d+)/
    const status_id = (_a = item == null ? void 0 : item.href.match(regex)) == null ? void 0 : _a[1]
    return status_id || ''
  }
  function addButtonToMediaList(item) {
    if (item.dataset.detected)
      return
    item.dataset.detected = 'true'
    const status_item = $('a[href*="/status/"]', item)
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
  async function click(btn, status_id, is_exist, index) {
    if (btn.classList.contains('loading'))
      return
    set_status(btn, 'loading')
    const json = await fetchTweet(status_id)
    const tweet = json.legacy
    const user = json.core.user_results.result.legacy
    const info = {}
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
    const tasks_result = []
    medias.forEach((media, i) => {
      let _a
      info.url = `${media.media_url_https.replace('jpg', 'png')}:large`
      info.file = ((_a = info.url.split('/').pop()) == null ? void 0 : _a.split(/[:?]/).shift()) || 'media'
      info['file-name'] = info.file.split('.').shift() || 'media'
      info['file-ext'] = info.file.split('.').pop() || 'jpg'
      info['file-type'] = media.type.replace('animated_', '') || 'photo'
      const shouldAppendIndex = (medias.length > 1 || index) && outFmt.match('{file-name}')
      const indexSuffix = shouldAppendIndex ? `-${index ? index - 1 : i}` : ''
      const formattedOut = `${outFmt}${indexSuffix}.{file-ext}`
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
  const imgDownload = {
    tagName: 'DIV',
    style: style$1,
    action: detect,
  }
  const isEnable = store.get('enableRmTweets', false)
  const whiteList = store.get('whiteList', [])
  function removeRetweets(el) {
    let _a, _b, _c
    if (!isEnable)
      return
    const svgWapper = '.css-175oi2r.r-18kxxzh.r-ogg1b9.r-1mrc8m9.r-obd0qt.r-1777fci'
    const svg = $(svgWapper, el)
    if (!svg)
      return
    const username = ((_b = (_a = svg.nextElementSibling) == null ? void 0 : _a.textContent) == null ? void 0 : _b.split(' ')[0]) || ''
    if (whiteList == null ? void 0 : whiteList.includes(username))
      return;
    (_c = svg.closest('article')) == null ? void 0 : _c.remove()
  }
  const rmRetweets = {
    tagName: 'DIV',
    action: removeRetweets,
  }
  const modules = [
    imgDownload,
    rmRetweets,
  ]
  function observeDoms() {
    const styles = modules.map(({ style: style2 }) => style2).filter(Boolean).join('\n').replace(/\\n|\n| {2}/g, '')
    document.head.insertAdjacentHTML('beforeend', `<style id="twitter-utils">${styles}</style>`)
    const observer = new MutationObserver(ms => ms.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (mutation.type !== 'childList' || node.nodeType !== Node.ELEMENT_NODE) {
          return
        }
        const el = node
        modules.forEach(({ tagName, action }) => {
          if (el.tagName === tagName.toUpperCase()) {
            action(el)
          }
        })
      })
    }))
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: false,
    })
  }
  function extractTimelineTweet(itemContent) {
    const tweetUnion = itemContent.tweet_results.result
    if (!tweetUnion) {
      logger.warn(
        'TimelineTweet is empty. This could happen when the tweet\'s visibility is limited by Twitter.',
        itemContent,
      )
      return null
    }
    return extractTweetUnion(tweetUnion)
  }
  function isTimelineEntryItem(entry) {
    return entry.content.entryType === 'TimelineTimelineItem'
  }
  function isTimelineEntryTweet(entry) {
    return isTimelineEntryItem(entry) && entry.entryId.startsWith('tweet-') && entry.content.itemContent.__typename === 'TimelineTweet'
  }
  function isTimelineEntryModule(entry) {
    return entry.content.entryType === 'TimelineTimelineModule'
  }
  function isTimelineEntryProfileConversation(entry) {
    return isTimelineEntryModule(entry) && entry.entryId.startsWith('profile-conversation-') && Array.isArray(entry.content.items)
  }
  function extractTweetUnion(tweet) {
    let _a, _b
    try {
      if (tweet.__typename === 'Tweet') {
        return tweet
      }
      if (tweet.__typename === 'TweetWithVisibilityResults') {
        return tweet.tweet
      }
      if (tweet.__typename === 'TweetTombstone') {
        logger.warn(`TweetTombstone received (Reason: ${(_b = (_a = tweet.tombstone) == null ? void 0 : _a.text) == null ? void 0 : _b.text})`, tweet)
        return null
      }
      if (tweet.__typename === 'TweetUnavailable') {
        logger.warn('TweetUnavailable received (Reason: unknown)', tweet)
        return null
      }
      logger.debug(tweet)
      logger.errorWithBanner('Unknown tweet type received')
    }
    catch (err) {
      logger.debug(tweet)
      logger.errorWithBanner('Failed to extract tweet', err)
    }
    return null
  }
  function tweetUrl(id, name = 'i') {
    return `https://twitter.com/${name}/status/${id}`
  }
  function snowId2millis(id) {
    return (BigInt(id) >> BigInt(22)) + BigInt(1288834974657)
  }
  function pubTime(id) {
    return new Date(Number(snowId2millis(id)))
  }
  function linkify(url, text) {
    const style2 = `
    color: rgb(27, 149, 224);
    text-decoration: none;
    display: inline-block;
  `.replace(/\s+/g, ' ').trim()
    return `<a target="_blank" href="${url}" style="${style2}"> ${text || url} </a>`
  }
  function hashTagLink(tag) {
    return linkify(`https://x.com/tags/${tag}`, `#${tag}`)
  }
  function mentionLink(name) {
    return linkify(`https://x.com/${name}`, `@${name}`)
  }
  class TextParser {
    constructor(text) {
      __publicField(this, 'text')
      this.text = text
    }

    parse() {
      return this.links().mentionInfo().hashTags().text
    }

    mentionInfo() {
      const regex = /@(?<username>\w+)\s/g
      this.text = this.text.replace(regex, (_match, username) => {
        return mentionLink(username)
      })
      return this
    }

    hashTags() {
      const regex = /#([\p{L}\p{N}]+)/gu
      this.text = this.text.replace(regex, (_match, tag) => {
        return hashTagLink(tag)
      })
      return this
    }

    links() {
      const regex = /https?:\/\/\S+/g
      this.text = this.text.replace(regex, (match) => {
        return linkify(match)
      })
      return this
    }
  }
  function parseText(text) {
    return new TextParser(text).parse()
  }
  function processTweet() {
    let _a, _b
    const oldElement = $('div[role="link"]')
    if (oldElement) {
      const newElement = oldElement.cloneNode(true);
      (_a = oldElement.parentNode) == null ? void 0 : _a.replaceChild(newElement, oldElement)
    }
    const tweetTexts = $$('div[data-testid="tweetText"]').splice(0, 2).map((div, idx) => {
      div.contentEditable = 'true'
      div.style.removeProperty('-webkit-line-clamp')
      const transBtn = div.nextElementSibling
      if (transBtn)
        transBtn.style.display = 'none'
      if (idx > 0) {
        const text = div.textContent
        div.innerHTML = parseText(`${text}
`)
      }
      return div
    })
    const showmore = $('div[data-testid="tweet-text-show-more-link"]')
    if (showmore)
      showmore.style.display = 'none'
    const time = $('a time')
    time.style = `
    margin-top: 8px;
    color: #536471;
    font-size: 0.9rem;
  `;
    (_b = tweetTexts[0].parentElement) == null ? void 0 : _b.appendChild(time.cloneNode(true))
  }
  async function editTweet() {
    let _a, _b
    const isInjected = document.getElementById('edit-tweet') !== null
    if (isInjected)
      return
    const newBtn = document.createElement('button')
    const btn = $('button[data-testid="app-bar-back"]')
    newBtn.textContent = '编辑'
    newBtn.title = '编辑推文'
    newBtn.id = 'edit-tweet'
    newBtn.style = `
    border: none;
    background: none;
    font-size: 1rem;
    margin-left: 6px;
    cursor: pointer;
`;
    (_b = (_a = btn.parentElement) == null ? void 0 : _a.parentElement) == null ? void 0 : _b.appendChild(newBtn)
    newBtn.onclick = processTweet
  }
  function webArchiveUrl(id, name = 'i') {
    return `https://web.archive.org/${tweetUrl(id, name)}`
  }
  function viewInArchiver(id, name) {
    const pub = formatDate(pubTime(id))
    const archiveUrl = webArchiveUrl(id, name)
    console.log(`The main tweet is deleted. Archive: ${archiveUrl}`)
    const text = `发布时间：${pub}
查看互联网档案馆存档 ↗`
    waitForElement('article span>a').then((node) => {
      const a = node
      a.textContent = text.replace(/\n/g, '，')
      a.href = archiveUrl
    })
    waitForElement('div[data-testid="error-detail"] span').then((node) => {
      const a = document.createElement('a')
      a.textContent = text
      a.target = '_blank'
      a.style = `
      color: #1da1f2;
      margin-top: 6px;
      text-decoration: none;
      display: block;
      font-weight: 700;
    `
      a.href = archiveUrl
      node == null ? void 0 : node.append(a)
    })
  }
  const TweetDetailInterceptor = (req, res, ext) => {
    let _a, _b
    if (!/\/graphql\/.+\/TweetDetail/.test(req.url)) {
      return
    }
    try {
      const json = JSON.parse(res.responseText)
      const instructions = json.data.threaded_conversation_with_injections_v2.instructions
      const timelineAddEntriesInstruction = instructions.find(
        i => i.type === 'TimelineAddEntries',
      )
      const timelineAddEntriesInstructionEntries = (timelineAddEntriesInstruction == null ? void 0 : timelineAddEntriesInstruction.entries) ?? []
      for (const entry of timelineAddEntriesInstructionEntries) {
        if (isTimelineEntryTweet(entry)) {
          const tweet = extractTimelineTweet(entry.content.itemContent)
          if (tweet) {
            continue
          }
          else {
            const tweetId = entry.entryId.split('-')[1]
            const replyItem = timelineAddEntriesInstructionEntries[1]
            const name = ((_b = (_a = replyItem.content) == null ? void 0 : _a.itemContent.tweet_results.result.legacy.entities.user_mentions[0]) == null ? void 0 : _b.screen_name) || 'i'
            viewInArchiver(tweetId, name)
          }
        }
      }
      editTweet()
    }
    catch (err) {
      logger.debug(req.method, req.url, res.status, res.responseText)
      logger.errorWithBanner('TweetDetail: Failed to parse API response', err)
      const urls = location.pathname.split('/')
      const name = urls[1]
      const id = urls.at(-1) || ''
      viewInArchiver(id, name)
    }
  }
  class TweetDetailModule extends Extension {
    constructor() {
      super(...arguments)
      __publicField(this, 'name', 'TweetDetailModule')
      __publicField(this, 'type', ExtensionType.TWEET)
    }

    intercept() {
      return TweetDetailInterceptor
    }
  }
  function numFmt(num) {
    return num.toString().replace(/\B(?=(\d{4})+(?!\d))/g, ',')
  }
  function fixFollowers(followers) {
    if (!followers || followers < 1e4)
      return
    const selector = 'a span.css-1jxf684.r-bcqeeo.r-1ttztb7.r-qvutc0.r-poiln3.r-n6v787.r-1f529hi.r-b88u0q'
    const el = $$(selector)
    const followersEl = el.at(1)
    if (followersEl) {
      followersEl.textContent = numFmt(followers)
    }
  }
  const UserTweetsInterceptor = (req, res, ext) => {
    if (!/\/graphql\/.+\/UserTweets/.test(req.url)) {
      return
    }
    try {
      const json = JSON.parse(res.responseText)
      const instructions = json.data.user.result.timeline_v2.timeline.instructions
      const newData = []
      const timelinePinEntryInstruction = instructions.find(
        i => i.type === 'TimelinePinEntry',
      )
      if (timelinePinEntryInstruction) {
        const tweet = extractTimelineTweet(timelinePinEntryInstruction.entry.content.itemContent)
        if (tweet) {
          newData.push(tweet)
        }
      }
      const timelineAddEntriesInstruction = instructions.find(
        i => i.type === 'TimelineAddEntries',
      )
      const timelineAddEntriesInstructionEntries = (timelineAddEntriesInstruction == null ? void 0 : timelineAddEntriesInstruction.entries) ?? []
      let followersCount = 0
      for (const entry of timelineAddEntriesInstructionEntries) {
        if (isTimelineEntryTweet(entry)) {
          const tweet = extractTimelineTweet(entry.content.itemContent)
          if (tweet) {
            newData.push(tweet)
          }
          if (followersCount === 0) {
            followersCount = (tweet == null ? void 0 : tweet.core.user_results.result.legacy.followers_count) ?? 0
            fixFollowers(followersCount)
          }
        }
        if (isTimelineEntryProfileConversation(entry)) {
          const tweetsInConversation = entry.content.items.map(i => extractTimelineTweet(i.item.itemContent)).filter(t => !!t)
          newData.push(...tweetsInConversation)
        }
      }
      logger.info(`UserTweets: ${newData.length} items received`)
    }
    catch (err) {
      logger.debug(req.method, req.url, res.status, res.responseText)
      logger.errorWithBanner('UserTweets: Failed to parse API response', err)
    }
  }
  class UserTweetsModule extends Extension {
    constructor() {
      super(...arguments)
      __publicField(this, 'name', 'UserTweetsModule')
      __publicField(this, 'type', ExtensionType.TWEET)
    }

    intercept() {
      return UserTweetsInterceptor
    }
  }
  function css(strings) {
    return String.raw(strings)
  }
  const style = css`
div, span {
  font-family: 'Microsoft YaHei' !important;
}
`
  _GM_addStyle(style)
  extensionManager.add(UserTweetsModule)
  extensionManager.add(TweetDetailModule)
  extensionManager.start()
  observeDoms()
})()
