// ==UserScript==
// @name         Instagram Exporter
// @namespace    chilfish/monkey
// @version      2024.09.17
// @author       monkey
// @description  Export Instagram posts
// @icon         https://www.instagram.com/static/images/ico/favicon-192.png/68d99ba29cc8.png
// @downloadURL  https://github.com/Chilfish/Scripts/raw/main/monkey/ins-exporter.user.js
// @updateURL    https://github.com/Chilfish/Scripts/raw/main/monkey/meta/ins-exporter.meta.js
// @match        https://www.instagram.com/*
// @grant        GM_getValue
// @grant        GM_registerMenuCommand
// @grant        GM_setValue
// @grant        unsafeWindow
// ==/UserScript==

(function () {
  'use strict'

  const suspectProtoRx = /"(?:_|\\u0{2}5[Ff]){2}(?:p|\\u0{2}70)(?:r|\\u0{2}72)(?:o|\\u0{2}6[Ff])(?:t|\\u0{2}74)(?:o|\\u0{2}6[Ff])(?:_|\\u0{2}5[Ff]){2}"\s*:/
  const suspectConstructorRx = /"(?:c|\\u0063)(?:o|\\u006[Ff])(?:n|\\u006[Ee])(?:s|\\u0073)(?:t|\\u0074)(?:r|\\u0072)(?:u|\\u0075)(?:c|\\u0063)(?:t|\\u0074)(?:o|\\u006[Ff])(?:r|\\u0072)"\s*:/
  const JsonSigRx = /^\s*["[{]|^\s*-?\d{1,16}(\.\d{1,17})?(E[+-]?\d+)?\s*$/i
  function jsonParseTransform(key, value) {
    if (key === '__proto__' || key === 'constructor' && value && typeof value === 'object' && 'prototype' in value) {
      warnKeyDropped(key)
      return
    }
    return value
  }
  function warnKeyDropped(key) {
    console.warn(`[destr] Dropping "${key}" key to prevent prototype pollution.`)
  }
  function destr(value, options = {}) {
    if (typeof value !== 'string') {
      return value
    }
    const _value = value.trim()
    if (

      value[0] === '"' && value.endsWith('"') && !value.includes('\\')
    ) {
      return _value.slice(1, -1)
    }
    if (_value.length <= 9) {
      const _lval = _value.toLowerCase()
      if (_lval === 'true') {
        return true
      }
      if (_lval === 'false') {
        return false
      }
      if (_lval === 'undefined') {
        return void 0
      }
      if (_lval === 'null') {
        return null
      }
      if (_lval === 'nan') {
        return Number.NaN
      }
      if (_lval === 'infinity') {
        return Number.POSITIVE_INFINITY
      }
      if (_lval === '-infinity') {
        return Number.NEGATIVE_INFINITY
      }
    }
    if (!JsonSigRx.test(value)) {
      if (options.strict) {
        throw new SyntaxError('[destr] Invalid JSON')
      }
      return value
    }
    try {
      if (suspectProtoRx.test(value) || suspectConstructorRx.test(value)) {
        if (options.strict) {
          throw new Error('[destr] Possible prototype pollution')
        }
        return JSON.parse(value, jsonParseTransform)
      }
      return JSON.parse(value)
    }
    catch (error) {
      if (options.strict) {
        throw error
      }
      return value
    }
  }
  const _GM_getValue = /* @__PURE__ */ (() => typeof GM_getValue != 'undefined' ? GM_getValue : void 0)()
  const _GM_registerMenuCommand = /* @__PURE__ */ (() => typeof GM_registerMenuCommand != 'undefined' ? GM_registerMenuCommand : void 0)()
  const _GM_setValue = /* @__PURE__ */ (() => typeof GM_setValue != 'undefined' ? GM_setValue : void 0)()
  const _unsafeWindow = /* @__PURE__ */ (() => typeof unsafeWindow != 'undefined' ? unsafeWindow : void 0)()
  const $ = (selector, root = document) => root == null ? void 0 : root.querySelector(selector)
  const $$ = (selector, root = document) => Array.from((root == null ? void 0 : root.querySelectorAll(selector)) || [])
  function saveBlobUrl(url, filename) {
    console.log(`Downloaded: ${filename} (${url})`)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    a.remove()
  }
  function saveAs(data, filename, inline = false) {
    let blob
    if (typeof data === 'string') {
      blob = new Blob([data], { type: 'text/plain' })
    }
    else if (data instanceof Blob) {
      blob = data
    }
    else {
      blob = new Blob(
        [JSON.stringify(data, null, inline ? 0 : 2)],
        { type: 'application/json' },
      )
    }
    const url = URL.createObjectURL(blob)
    saveBlobUrl(url, filename)
    URL.revokeObjectURL(url)
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
  const urlMatch = 'graphql/query'
  const tweetKey = 'xdt_api__v1__feed__user_timeline_graphql_connection'
  let user
  const tweets = []
  const getTweets = (request, response) => {
    if (!request.url.includes(urlMatch))
      return
    const { data } = destr(response.responseText)
    if (!data[tweetKey])
      return
    const { edges, page_info } = data[tweetKey]
    console.log('fetched:', tweets.length)
    tweets.push(
      ...edges.map(({ node }) => {
        const { code, caption, owner, carousel_media, image_versions2 } = node
        if (!caption)
          return null
        let images = carousel_media == null ? void 0 : carousel_media.map(({ image_versions2: image_versions22 }) => image_versions22.candidates[0].url)
        if (!images)
          images = [image_versions2.candidates[0].url]
        user = {
          username: owner.username,
          full_name: owner.full_name,
          profile_pic_url: owner.profile_pic_url,
        }
        return {
          id: code,
          text: caption.text,
          created_at: formatDate(caption.created_at),
          images,
        }
      }).filter(Boolean),
    )
    if (!(page_info == null ? void 0 : page_info.has_next_page) && tweets.length > 0) {
      const now = (/* @__PURE__ */ new Date()).getTime()
      saveAs(
        { user, tweets },
        `${user == null ? void 0 : user.username}-${now}.json`,
      )
    }
  }
  const __vite_glob_0_0 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
    __proto__: null,
    getTweets,
  }, Symbol.toStringTag, { value: 'Module' }))
  const globalObject = _unsafeWindow ?? window ?? globalThis
  const xhrOpen = globalObject.XMLHttpRequest.prototype.open
  function httpHooks(interceptors = []) {
    globalObject.XMLHttpRequest.prototype.open = function (method, url) {
      this.addEventListener('load', () => {
        interceptors.forEach(func => func({ method, url }, this))
      })
      xhrOpen.apply(this, arguments)
    }
  }
  const delay = (ms = 1e3) => new Promise(resolve => setTimeout(resolve, ms))
  function findImgBox() {
    let imgBox = $('.x6s0dn4.x1dqoszc.xu3j5b3.xm81vs4.x78zum5.x1iyjqo2.x1tjbqro')
    if (isProfile())
      imgBox = $('article[role="presentation"] ._aatk._aatl._aatm')
    console.log(imgBox)
    return imgBox
  }
  async function findImgs(imgBox) {
    const urls = /* @__PURE__ */ new Set()
    while (true) {
      const img = $$('img', imgBox)
      img.map(i => urls.add(i.src))
      const nextBtn = $('button[aria-label="Next"]')
      console.log(urls)
      if (!nextBtn)
        return Array.from(urls)
      nextBtn.click()
      await delay(800)
    }
  }
  function isProfile() {
    return !!$('h2')
  }
  async function doanload(url, filename) {
    const res = await fetch(url, {
      headers: {
        'User-Agent': navigator.userAgent,
      },
      mode: 'cors',
    })
    const blob = await res.blob()
    saveAs(blob, filename)
  }
  async function main() {
    let _a
    const imgBox = findImgBox()
    const imgs = await findImgs(imgBox)
    const time = ((_a = $('time', imgBox.nextElementSibling)) == null ? void 0 : _a.dateTime) || Date.now()
    const id = location.pathname.split('/').at(-2)
    console.log({ imgs, time, id })
    let idx = 0
    for (const img of imgs) {
      const suffix = imgs.length > 1 ? `-${++idx}` : ''
      const filename = `${formatDate(time)}-${id}${suffix}.jpg`
      await doanload(img, filename)
    }
  }
  _GM_registerMenuCommand('下载媒体', main)
  const enableAllTweets = _GM_getValue('enableAllTweets', false)
  const modules = /* @__PURE__ */ Object.assign({
    './modules/user-tweets.ts': __vite_glob_0_0,
  })
  if (enableAllTweets) {
    httpHooks(Object.values(modules).map(m => m()))
  }
  console.debug('ins-export loaded', { enableAllTweets })
  _GM_registerMenuCommand(
    `导出所有推文 ${enableAllTweets ? '（已启用）' : ''}`,
    () => {
      _GM_setValue('enableAllTweets', !enableAllTweets)
      location.reload()
    },
  )
})()
