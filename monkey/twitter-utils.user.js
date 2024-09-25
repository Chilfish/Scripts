// ==UserScript==
// @name         推特小工具
// @namespace    chilfish/monkey
// @version      2024.09.17
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
  const $ = (selector, root = document) => root == null ? void 0 : root.querySelector(selector)
  function waitForElement(selector, textContent = false) {
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
  function date2webArchive(date) {
    const year = date.getFullYear()
    const month = date.getMonth()
    const day = date.getDate()
    return `${year}${month}${day}000000`
  }
  function webArchiveUrl(id, name = 'i') {
    return `https://web.archive.org/web/${date2webArchive(pubTime(id))}/${tweetUrl(id, name)}`
  }
  const TweetDetailInterceptor = (req, res, ext) => {
    if (!/\/graphql\/.+\/TweetDetail/.test(req.url)) {
      return
    }
    try {
      const json = JSON.parse(res.responseText)
      const instructions = json.data.threaded_conversation_with_injections_v2.instructions
      const newData = []
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
            const archiveUrl = webArchiveUrl(tweetId)
            console.log(`The main tweet is deleted. Archive: ${archiveUrl}`)
            waitForElement('article span>a').then((node) => {
              const a = node
              a.textContent = '查看互联网档案馆存档 ↗'
              a.href = archiveUrl
            })
          }
        }
      }
    }
    catch (err) {
      logger.debug(req.method, req.url, res.status, res.responseText)
      logger.errorWithBanner('TweetDetail: Failed to parse API response', err)
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
  extensionManager.add(TweetDetailModule)
  extensionManager.start()
})(preactSignalsCore)
