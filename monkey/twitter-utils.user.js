// ==UserScript==
// @name         推特小工具
// @namespace    chilfish/monkey
// @version      2024.10.03
// @author       monkey
// @description  推特小工具
// @icon         https://abs.twimg.com/favicons/twitter.ico
// @downloadURL  https://github.com/Chilfish/Scripts/raw/main/monkey/twitter-utils.user.js
// @updateURL    https://github.com/Chilfish/Scripts/raw/main/monkey/meta/twitter-utils.meta.js
// @match        https://twitter.com/*
// @match        https://x.com/*
// @require      https://cdn.jsdelivr.net/npm/dayjs@1.11.10/dayjs.min.js
// @require      https://cdn.jsdelivr.net/npm/@preact/signals-core@1.5.1/dist/signals-core.min.js
// @grant        unsafeWindow
// @run-at       document-start
// ==/UserScript==

(function (signalsCore) {
  'use strict'

  const __defProp = Object.defineProperty
  const __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value
  const __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== 'symbol' ? `${key}` : key, value)
  const _unsafeWindow = /* @__PURE__ */ (() => typeof unsafeWindow != 'undefined' ? unsafeWindow : void 0)()
  const appname = '[twitter-utils]'
  class Logger {
    constructor() {
      __publicField(this, 'index', 0)
      __publicField(this, 'buffer', [])
      __publicField(this, 'bufferTimer', null)
    }

    info(line, ...args) {
      console.info(appname, line, ...args)
      this.writeBuffer({ type: 'info', line, index: this.index++ })
    }

    warn(line, ...args) {
      console.warn(appname, line, ...args)
      this.writeBuffer({ type: 'warn', line, index: this.index++ })
    }

    error(line, ...args) {
      console.error(appname, line, ...args)
      this.writeBuffer({ type: 'error', line, index: this.index++ })
    }

    errorWithBanner(msg, err, ...args) {
      this.error(
        `${msg} (Message: ${(err == null ? void 0 : err.message) ?? 'none'})
  This may be a problem caused by Twitter updates.
  Please file an issue on GitHub:
  https://github.com/prinsss/twitter-web-exporter/issues`,
        ...args,
      )
    }

    debug(...args) {
      console.debug(...args)
    }

    /**
     * Buffer log lines to reduce the number of signal and DOM updates.
     */
    writeBuffer(log) {
      this.buffer.push(log)
      if (this.bufferTimer) {
        clearTimeout(this.bufferTimer)
      }
      this.bufferTimer = window.setTimeout(() => {
        this.bufferTimer = null
        this.flushBuffer()
      }, 0)
    }

    /**
     * Flush buffered log lines and update the UI.
     */
    flushBuffer() {
      this.buffer = []
    }
  }
  const logger = new Logger()
  const globalObject = _unsafeWindow ?? window ?? globalThis
  const xhrOpen = globalObject.XMLHttpRequest.prototype.open
  class ExtensionManager {
    constructor() {
      __publicField(this, 'extensions', /* @__PURE__ */ new Map())
      __publicField(this, 'disabledExtensions', /* @__PURE__ */ new Set())
      /**
       * Signal for subscribing to extension changes.
       */
      __publicField(this, 'signal', new signalsCore.Signal(1))
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
        this.signal.value++
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
        this.signal.value++
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
  const $ = (selector, root = document) => root == null ? void 0 : root.querySelector(selector)
  const $$ = (selector, root = document) => Array.from((root == null ? void 0 : root.querySelectorAll(selector)) || [])
  function waitForElement(selector, textContent = true) {
    return new Promise((resolve) => {
      function got(el2) {
        if (textContent && el2.textContent)
          resolve(el2)
        return resolve(el2)
      }
      const el = $(selector)
      if (el) {
        got(el)
        return
      }
      const observer = new MutationObserver(() => {
        const el2 = $(selector)
        if (el2) {
          observer.disconnect()
          got(el2)
        }
      })
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: false,
      })
    })
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
  function processTweet() {
    let _a, _b
    const oldElement = $('div[role="link"]')
    if (oldElement) {
      const newElement = oldElement.cloneNode(true);
      (_a = oldElement.parentNode) == null ? void 0 : _a.replaceChild(newElement, oldElement)
    }
    const tweetTexts = $$('div[data-testid="tweetText"]').splice(0, 2).map((div) => {
      div.contentEditable = 'true'
      div.style.removeProperty('-webkit-line-clamp')
      const transBtn = div.nextElementSibling
      if (transBtn)
        transBtn.style.display = 'none'
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
  function tweetUrl(id, name = 'i') {
    return `https://twitter.com/${name}/status/${id}`
  }
  function snowId2millis(id) {
    return (BigInt(id) >> BigInt(22)) + BigInt(1288834974657)
  }
  function pubTime(id) {
    return new Date(Number(snowId2millis(id)))
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
    if (!followers || followers < 1e3)
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
  extensionManager.add(UserTweetsModule)
  extensionManager.add(TweetDetailModule)
  extensionManager.start()
})(preactSignalsCore)
