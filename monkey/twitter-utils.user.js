// ==UserScript==
// @name         推特小工具
// @namespace    chilfish/monkey
// @version      2025.06.01
// @author       Chilfish
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

  const _GM_addStyle = (() => typeof GM_addStyle != 'undefined' ? GM_addStyle : void 0)()
  const _GM_deleteValue = (() => typeof GM_deleteValue != 'undefined' ? GM_deleteValue : void 0)()
  const _GM_download = (() => typeof GM_download != 'undefined' ? GM_download : void 0)()
  const _GM_getValue = (() => typeof GM_getValue != 'undefined' ? GM_getValue : void 0)()
  const _GM_setValue = (() => typeof GM_setValue != 'undefined' ? GM_setValue : void 0)()
  const _unsafeWindow = (() => typeof unsafeWindow != 'undefined' ? unsafeWindow : void 0)()
  const appname = '[twitter-utils]'
  const logger = {
    info: console.info,
    warn: console.warn,
    error: console.error,
    errorWithBanner: (msg, err, ...args) => {
      console.error(appname, msg, err?.message ?? 'none', ...args)
    },
    debug: console.info,
  }
  const globalObject = _unsafeWindow ?? window ?? globalThis
  const xhrOpen = globalObject.XMLHttpRequest.prototype.open
  class ExtensionManager {
    extensions = new Map()
    disabledExtensions = new Set()
    constructor() {
      this.installHttpHooks()
    }

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
  var ExtensionType = ((ExtensionType2) => {
    ExtensionType2.TWEET = 'tweet'
    ExtensionType2.USER = 'user'
    ExtensionType2.NONE = 'none'
    return ExtensionType2
  })(ExtensionType || {})
  class Extension {
    name = ''
    enabled = true
    type = 'none'
    manager
    constructor(manager) {
      this.manager = manager
    }

    setup() {
    }

    dispose() {
    }

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
  const downloader = (() => {
    const tasks = []
    const MAX_RETRY = 2
    const MAX_THREADS = 2
    let activeThreads = 0
    let retryCount = 0
    const isSaveAs = store.get('saveAs', false)
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
      retryCount++
      if (retryCount === 3)
        activeThreads = 1
      if (task.retry && task.retry >= MAX_RETRY || result.details?.current === 'USER_CANCELED') {
        task.onerror?.(result)
      }
      else {
        if (activeThreads === 1)
          task.retry = (task.retry || 0) + 1
        addTask(task)
      }
    }
    function executeTask(task) {
      return new Promise(
        (resolve) => {
          let downloadUrl = task.url
          const name = encodeURIComponent(task.name)
          if (isSaveAs) {
            downloadUrl = `https://proxy.chilfish.top/${name}?url=${downloadUrl}`
          }
          return _GM_download({
            url: downloadUrl,
            name,
            saveAs: isSaveAs,
            onload: () => {
              task.onload?.()
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
          })
        },
      )
    }
    return { add: addTask }
  })()
  const style$1 = '.tmd-down {\r\n  margin-left: 12px;\r\n  order: 99;\r\n  cursor: pointer;\r\n}\r\n\r\n.tmd-bar-btn {\r\n  padding-top: 8px;\r\n  font-size: 1rem;\r\n}\r\n\r\n.tmd-down:hover > div > div > div > div {\r\n  color: rgba(29, 161, 242, 1);\r\n}\r\n\r\n.tmd-down:hover > div > div > div > div > div {\r\n  background-color: rgba(29, 161, 242, 0.1);\r\n}\r\n\r\n.tmd-down:active > div > div > div > div > div {\r\n  background-color: rgba(29, 161, 242, 0.2);\r\n}\r\n\r\n.tmd-down:hover svg {\r\n  color: rgba(29, 161, 242, 1);\r\n}\r\n\r\n.tmd-down:hover div:first-child:not(:last-child) {\r\n  background-color: rgba(29, 161, 242, 0.1);\r\n}\r\n\r\n.tmd-down:active div:first-child:not(:last-child) {\r\n  background-color: rgba(29, 161, 242, 0.2);\r\n}\r\n\r\n.tmd-down.tmd-media {\r\n  position: absolute;\r\n  right: 0;\r\n  display: none;\r\n}\r\n\r\na[data-detected]:hover .tmd-down.tmd-media,\r\narticle[data-detected] img:hover .tmd-down.tmd-media {\r\n  display: flex;\r\n}\r\n\r\n.tmd-down.tmd-media > div {\r\n  display: flex;\r\n  border-radius: 99px;\r\n  margin: 2px;\r\n}\r\n\r\n.tmd-down.tmd-media > div > div {\r\n  display: flex;\r\n  margin: 6px;\r\n  color: #fff;\r\n}\r\n\r\n.tmd-down.tmd-media:hover > div {\r\n  background-color: rgba(255, 255, 255, 0.6);\r\n}\r\n\r\n.tmd-down.tmd-media:hover > div > div {\r\n  color: rgba(29, 161, 242, 1);\r\n}\r\n\r\n.tmd-down.tmd-media:not(:hover) > div > div {\r\n  filter: drop-shadow(0 0 1px #000);\r\n}\r\n\r\n.tmd-down g {\r\n  display: none;\r\n}\r\n\r\n.tmd-down.download g.download,\r\n.tmd-down.completed g.completed,\r\n.tmd-down.loading g.loading,\r\n.tmd-down.failed g.failed {\r\n  display: unset;\r\n}\r\n\r\n.tmd-down.loading svg {\r\n  animation: spin 1s linear infinite;\r\n}\r\n\r\n@keyframes spin {\r\n  0% {\r\n    transform: rotate(0deg);\r\n  }\r\n\r\n  100% {\r\n    transform: rotate(360deg);\r\n  }\r\n}\r\n\r\n.tmd-btn {\r\n  display: inline-block;\r\n  background-color: #1da1f2;\r\n  color: #ffffff;\r\n  padding: 0 20px;\r\n  border-radius: 99px;\r\n}\r\n\r\n.tmd-tag {\r\n  display: inline-block;\r\n  background-color: #ffffff;\r\n  color: #1da1f2;\r\n  padding: 0 10px;\r\n  border-radius: 10px;\r\n  border: 1px solid #1da1f2;\r\n  font-weight: bold;\r\n  margin: 5px;\r\n}\r\n\r\n.tmd-btn:hover {\r\n  background-color: rgba(29, 161, 242, 0.9);\r\n}\r\n\r\n.tmd-tag:hover {\r\n  background-color: rgba(29, 161, 242, 0.1);\r\n}\r\n\r\n.tmd-down.tmd-img {\r\n  position: absolute;\r\n  right: 0;\r\n  bottom: 0;\r\n  display: none !important;\r\n}\r\n\r\n.tmd-down.tmd-img > div {\r\n  display: flex;\r\n  border-radius: 99px;\r\n  margin: 2px;\r\n  background-color: rgba(255, 255, 255, 0.6);\r\n}\r\n\r\n.tmd-down.tmd-img > div > div {\r\n  display: flex;\r\n  margin: 6px;\r\n  color: #fff !important;\r\n}\r\n\r\n.tmd-down.tmd-img:not(:hover) > div > div {\r\n  filter: drop-shadow(0 0 1px #000);\r\n}\r\n\r\n.tmd-down.tmd-img:hover > div > div {\r\n  color: rgba(29, 161, 242, 1);\r\n}\r\n\r\n:hover > .tmd-down.tmd-img,\r\n.tmd-img.loading,\r\n.tmd-img.completed,\r\n.tmd-img.failed {\r\n  display: block !important;\r\n}\r\n\r\n.tweet-detail-action-item {\r\n  width: 20% !important;\r\n}\r\n'
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
    if (!item?.href) {
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
      btn_group?.appendChild(btn_down)
      const urls = imgLinks.map(item => $('img', item)?.src).filter(url => !!url)
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
      const downloadUrl = url.href
      console.log('download', imgUrl, name)
      downloader.add({
        url: downloadUrl,
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
    if (!isEnable)
      return
    const svgWapper = '.css-175oi2r.r-18kxxzh.r-ogg1b9.r-1mrc8m9.r-obd0qt.r-1777fci'
    const svg = $(svgWapper, el)
    if (!svg)
      return
    const article = svg.closest('article')
    if (!article)
      return
    const reTweetUser = $('span[data-testid="socialContext"]', article)?.parentElement
    const username = reTweetUser?.href.split('/').pop() || ''
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
    try {
      if (tweet.__typename === 'Tweet') {
        return tweet
      }
      if (tweet.__typename === 'TweetWithVisibilityResults') {
        return tweet.tweet
      }
      if (tweet.__typename === 'TweetTombstone') {
        logger.warn(`TweetTombstone received (Reason: ${tweet.tombstone?.text?.text})`, tweet)
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
    text
    constructor(text) {
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
    const oldElement = $('div[role="link"]')
    if (oldElement) {
      const newElement = oldElement.cloneNode(true)
      oldElement.parentNode?.replaceChild(newElement, oldElement)
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
  `
    tweetTexts[0].parentElement?.appendChild(time.cloneNode(true))
  }
  async function editTweet() {
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
`
    btn.parentElement?.parentElement?.appendChild(newBtn)
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
      node?.append(a)
    })
  }
  const TweetDetailInterceptor = (req, res, ext) => {
    if (!/\/graphql\/.+\/TweetDetail/.test(req.url)) {
      return
    }
    try {
      const json = JSON.parse(res.responseText)
      const instructions = json.data.threaded_conversation_with_injections_v2.instructions
      const timelineAddEntriesInstruction = instructions.find(
        i => i.type === 'TimelineAddEntries',
      )
      const timelineAddEntriesInstructionEntries = timelineAddEntriesInstruction?.entries ?? []
      for (const entry of timelineAddEntriesInstructionEntries) {
        if (isTimelineEntryTweet(entry)) {
          const tweet = extractTimelineTweet(entry.content.itemContent)
          if (tweet) {
            continue
          }
          else {
            const tweetId = entry.entryId.split('-')[1]
            const replyItem = timelineAddEntriesInstructionEntries[1]
            const name = replyItem.content?.itemContent.tweet_results.result.legacy.entities.user_mentions[0]?.screen_name || 'i'
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
    name = 'TweetDetailModule'
    type = ExtensionType.TWEET
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
      const timelineAddEntriesInstructionEntries = timelineAddEntriesInstruction?.entries ?? []
      let followersCount = 0
      for (const entry of timelineAddEntriesInstructionEntries) {
        if (isTimelineEntryTweet(entry)) {
          const tweet = extractTimelineTweet(entry.content.itemContent)
          if (tweet) {
            newData.push(tweet)
          }
          if (followersCount === 0) {
            followersCount = tweet?.core.user_results.result.legacy.followers_count ?? 0
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
    name = 'UserTweetsModule'
    type = ExtensionType.TWEET
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
