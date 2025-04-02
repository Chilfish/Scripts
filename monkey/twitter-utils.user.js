// ==UserScript==
// @name         推特小工具
// @namespace    chilfish/monkey
// @version      2025.04.02
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
    debug: console.info,
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
  function tweetUrl(id, name = 'i') {
    return `https://twitter.com/${name}/status/${id}`
  }
  function snowId2millis(id) {
    return (BigInt(id) >> BigInt(22)) + BigInt(1288834974657)
  }
  function pubTime(id) {
    return new Date(Number(snowId2millis(id)))
  }
  function $(selector, root) {
    return (root || document).querySelector(selector)
  }
  function $$(selector, root) {
    return Array.from((root || document).querySelectorAll(selector))
  }
  function css(strings, ...values) {
    if (!strings.length)
      return ''
    return String.raw(strings, ...values)
  }
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
  function formatDate(time, fmt = 'YYYY-MM-DD HH:mm:ss') {
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
  const style$1 = '.tmd-down {\n  margin-left: 12px;\n  order: 99;\n  cursor: pointer;\n}\n\n.tmd-bar-btn {\n  padding-top: 8px;\n  font-size: 1rem;\n}\n\n.tmd-down:hover > div > div > div > div {\n  color: rgba(29, 161, 242, 1);\n}\n\n.tmd-down:hover > div > div > div > div > div {\n  background-color: rgba(29, 161, 242, 0.1);\n}\n\n.tmd-down:active > div > div > div > div > div {\n  background-color: rgba(29, 161, 242, 0.2);\n}\n\n.tmd-down:hover svg {\n  color: rgba(29, 161, 242, 1);\n}\n\n.tmd-down:hover div:first-child:not(:last-child) {\n  background-color: rgba(29, 161, 242, 0.1);\n}\n\n.tmd-down:active div:first-child:not(:last-child) {\n  background-color: rgba(29, 161, 242, 0.2);\n}\n\n.tmd-down.tmd-media {\n  position: absolute;\n  right: 0;\n  display: none;\n}\n\na[data-detected]:hover .tmd-down.tmd-media,\narticle[data-detected] img:hover .tmd-down.tmd-media {\n  display: flex;\n}\n\n.tmd-down.tmd-media > div {\n  display: flex;\n  border-radius: 99px;\n  margin: 2px;\n}\n\n.tmd-down.tmd-media > div > div {\n  display: flex;\n  margin: 6px;\n  color: #fff;\n}\n\n.tmd-down.tmd-media:hover > div {\n  background-color: rgba(255, 255, 255, 0.6);\n}\n\n.tmd-down.tmd-media:hover > div > div {\n  color: rgba(29, 161, 242, 1);\n}\n\n.tmd-down.tmd-media:not(:hover) > div > div {\n  filter: drop-shadow(0 0 1px #000);\n}\n\n.tmd-down g {\n  display: none;\n}\n\n.tmd-down.download g.download,\n.tmd-down.completed g.completed,\n.tmd-down.loading g.loading,\n.tmd-down.failed g.failed {\n  display: unset;\n}\n\n.tmd-down.loading svg {\n  animation: spin 1s linear infinite;\n}\n\n@keyframes spin {\n  0% {\n    transform: rotate(0deg);\n  }\n\n  100% {\n    transform: rotate(360deg);\n  }\n}\n\n.tmd-btn {\n  display: inline-block;\n  background-color: #1da1f2;\n  color: #ffffff;\n  padding: 0 20px;\n  border-radius: 99px;\n}\n\n.tmd-tag {\n  display: inline-block;\n  background-color: #ffffff;\n  color: #1da1f2;\n  padding: 0 10px;\n  border-radius: 10px;\n  border: 1px solid #1da1f2;\n  font-weight: bold;\n  margin: 5px;\n}\n\n.tmd-btn:hover {\n  background-color: rgba(29, 161, 242, 0.9);\n}\n\n.tmd-tag:hover {\n  background-color: rgba(29, 161, 242, 0.1);\n}\n\n.tmd-down.tmd-img {\n  position: absolute;\n  right: 0;\n  bottom: 0;\n  display: none !important;\n}\n\n.tmd-down.tmd-img > div {\n  display: flex;\n  border-radius: 99px;\n  margin: 2px;\n  background-color: rgba(255, 255, 255, 0.6);\n}\n\n.tmd-down.tmd-img > div > div {\n  display: flex;\n  margin: 6px;\n  color: #fff !important;\n}\n\n.tmd-down.tmd-img:not(:hover) > div > div {\n  filter: drop-shadow(0 0 1px #000);\n}\n\n.tmd-down.tmd-img:hover > div > div {\n  color: rgba(29, 161, 242, 1);\n}\n\n:hover > .tmd-down.tmd-img,\n.tmd-img.loading,\n.tmd-img.completed,\n.tmd-img.failed {\n  display: block !important;\n}\n\n.tweet-detail-action-item {\n  width: 20% !important;\n}\n'
  const downloadStatus = ['download', 'completed', 'loading', 'failed']
  function setStatus(btn, className) {
    btn.classList.remove(...downloadStatus)
    btn.classList.add(className)
  }
  const historyKey = 'download_history'
  const idHistory = store.get(historyKey, [])
  function addHistory(status_id) {
    if (idHistory.includes(status_id))
      return
    idHistory.push(status_id)
    store.set(historyKey, idHistory)
  }
  function detect(node) {
    if (!node)
      return
    const isArticle = node.tagName === 'ARTICLE' || node.tagName === 'DIV'
    const article = isArticle ? $('article', node) || node.closest('article') : null
    if (article)
      addButtonToArticle(article)
    const isListItems = node.tagName === 'LI' && node.getAttribute('role') === 'listitem' && [node] || node.tagName === 'DIV'
    const listitems = isListItems ? $$('li[role="listitem"] a', node) : []
    setTimeout(() => listitems.forEach(addButtonToImgs), 1e3)
  }
  function getStatusInfo(item) {
    if (!(item == null ? void 0 : item.href)) {
      return {
        statusId: '',
        username: '',
      }
    }
    const paths = new URL(item.href).pathname.split('/').filter(Boolean)
    return {
      statusId: paths[2],
      username: paths[0],
    }
  }
  function createDownBtn(statusId) {
    const downBtnSVG = `<svg viewBox="0 0 24 24" style="width: 18px; height: 18px;"><g class="download"><path d="M3,14 v5 q0,2 2,2 h14 q2,0 2,-2 v-5 M7,10 l4,4 q1,1 2,0 l4,-4 M12,3 v11" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" /></g>
<g class="completed"><path d="M3,14 v5 q0,2 2,2 h14 q2,0 2,-2 v-5 M7,10 l3,4 q1,1 2,0 l8,-11" fill="none" stroke="#1DA1F2" stroke-width="2" stroke-linecap="round" /></g>
<g class="loading"><circle cx="12" cy="12" r="10" fill="none" stroke="#1DA1F2" stroke-width="4" opacity="0.4" /><path d="M12,2 a10,10 0 0 1 10,10" fill="none" stroke="#1DA1F2" stroke-width="4" stroke-linecap="round" /></g>
<g class="failed"><circle cx="12" cy="12" r="11" fill="#f33" stroke="currentColor" stroke-width="2" opacity="0.8" /><path d="M14,5 a1,1 0 0 0 -4,0 l0.5,9.5 a1.5,1.5 0 0 0 3,0 z M12,17 a2,2 0 0 0 0,4 a2,2 0 0 0 0,-4" fill="#fff" stroke="none" /></g></svg>
`
    const downBtn = document.createElement('div')
    const is_exist = idHistory.includes(statusId)
    const downStatus = is_exist ? 'completed' : 'download'
    downBtn.classList.add('tmd-down', downStatus)
    downBtn.innerHTML = `<div><div>${downBtnSVG}</div></div>`
    return downBtn
  }
  function addButtonToArticle(article) {
    if (article.dataset.detected)
      return
    article.dataset.detected = 'true'
    const media_selector = [
      'a[href*="/photo/1"]',
      'a[href="/settings/content_you_see"]',
      // hidden content
    ]
    const media = $(media_selector.join(','), article)
    if (!media)
      return
    const imgLinks = $$('a[href*="/photo/"]', article)
    setTimeout(() => imgLinks.forEach(addButtonToImgs), 1e3)
    const { username, statusId } = getStatusInfo(imgLinks[0])
    const status_item = $('a[href*="/status/"]', article)
    const status_id = getStatusInfo(status_item)
    if (!status_id)
      return
    setTimeout(() => {
      const btn_group = $('div[role="group"]:last-of-type, ul.tweet-actions, ul.tweet-detail-actions', article)
      const btn_down = createDownBtn(statusId)
      btn_down.classList.add('tmd-bar-btn')
      btn_group == null ? void 0 : btn_group.appendChild(btn_down)
      const urls = imgLinks.map((item) => {
        let _a
        return (_a = $('img', item)) == null ? void 0 : _a.src
      }).filter(url => !!url)
      btn_down.onclick = (e) => {
        e.preventDefault()
        e.stopPropagation()
        click(btn_down, statusId, urls, username)
      }
    }, 1e3)
  }
  function addButtonToImgs(item) {
    if (item.dataset.detected)
      return
    const { statusId, username } = getStatusInfo(item)
    const img = $('img', item)
    const downBtn = createDownBtn(statusId)
    downBtn.classList.add('tmd-media')
    downBtn.onclick = (e) => {
      e.preventDefault()
      e.stopPropagation()
      click(downBtn, statusId, [img.src], username)
    }
    item.appendChild(downBtn)
    item.dataset.detected = 'true'
  }
  async function click(btn, statusId, imgUrls, userId) {
    if (btn.classList.contains('loading'))
      return
    setStatus(btn, 'loading')
    imgUrls.forEach((imgUrl, idx) => {
      const time = pubTime(statusId)
      const formatTime = formatDate(time, 'YYYYMMDD_HHmmss')
      let afterFix = ''
      if (idx > 0)
        afterFix = `-${idx}`
      const name = `${userId}-${formatTime}-${statusId}${afterFix}.png`
      const url = new URL(imgUrl)
      url.search = '?format=png&name=large'
      console.log('download', imgUrl, name)
      downloader.add({
        url: url.href,
        name,
        onload: async () => {
          setStatus(btn, 'completed')
          addHistory(statusId)
        },
        onerror: (result) => {
          setStatus(btn, 'failed')
          console.log('image donwload error', result)
        },
      })
    })
  }
  const imgDownload = {
    tagName: 'DIV',
    style: style$1,
    action: detect,
  }
  const isEnable = store.get('enableRmTweets', false)
  const whiteList = store.get('whiteList', [])
  function removeRetweets(el) {
    let _a
    if (!isEnable)
      return
    const svgWapper = '.css-175oi2r.r-18kxxzh.r-ogg1b9.r-1mrc8m9.r-obd0qt.r-1777fci'
    const svg = $(svgWapper, el)
    if (!svg)
      return
    const article = svg.closest('article')
    if (!article)
      return
    const reTweetUser = (_a = $('span[data-testid="socialContext"]', article)) == null ? void 0 : _a.parentElement
    const username = (reTweetUser == null ? void 0 : reTweetUser.href.split('/').pop()) || ''
    if (whiteList.includes(username))
      return
    article.remove()
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
