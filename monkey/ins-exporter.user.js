// ==UserScript==
// @name         ins-exporter
// @namespace    chilfish/monkey
// @version      2024.05.31
// @author       monkey
// @description  Export Instagram posts
// @icon         https://www.instagram.com/static/images/ico/favicon-192.png/68d99ba29cc8.png
// @downloadURL  https://github.com/Chilfish/Scripts/raw/main/monkey/ins-exporter.user.js
// @updateURL    https://github.com/Chilfish/Scripts/raw/main/monkey/ins-exporter.meta.js
// @match        https://www.instagram.com/*
// @grant        GM_getValue
// @grant        GM_registerMenuCommand
// @grant        GM_setValue
// @grant        unsafeWindow
// ==/UserScript==

(function () {
  'use strict'

  const _GM_getValue = /* @__PURE__ */ (() => typeof GM_getValue != 'undefined' ? GM_getValue : void 0)()
  const _GM_registerMenuCommand = /* @__PURE__ */ (() => typeof GM_registerMenuCommand != 'undefined' ? GM_registerMenuCommand : void 0)()
  const _GM_setValue = /* @__PURE__ */ (() => typeof GM_setValue != 'undefined' ? GM_setValue : void 0)()
  const _unsafeWindow = /* @__PURE__ */ (() => typeof unsafeWindow != 'undefined' ? unsafeWindow : void 0)()
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
  const $ = (selector, root = document) => root == null ? void 0 : root.querySelector(selector)
  const $$ = (selector, root = document) => Array.from((root == null ? void 0 : root.querySelectorAll(selector)) || [])
  const dealy = ms => new Promise(resolve => setTimeout(resolve, ms))
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
  function formatTime(time, fmt = 'YYYY-MM-DD HH:mm:ss') {
    if (typeof time === 'number' && time < 1e12)
      time *= 1e3
    const date = new Date(time)
    if (Number.isNaN(date.getTime()))
      return ''
    const year = date.getFullYear().toString()
    const month = (date.getMonth() + 1).toString()
    const day = date.getDate().toString()
    const hour = date.getHours().toString()
    const minute = date.getMinutes().toString()
    const second = date.getSeconds().toString()
    return fmt.replace('YYYY', year).replace('MM', month.padStart(2, '0')).replace('DD', day.padStart(2, '0')).replace('HH', hour.padStart(2, '0')).replace('mm', minute.padStart(2, '0')).replace('ss', second.padStart(2, '0'))
  }
  function parseJson(json) {
    try {
      return JSON.parse(json)
    }
    catch {
      return null
    }
  }
  const urlMatch = 'graphql/query'
  let user
  const tweets = []
  let started = false
  const getTweets = (request, response) => {
    if (!request.url.includes(urlMatch))
      return
    const tweetKey = 'xdt_api__v1__feed__user_timeline_graphql_connection'
    const { data } = parseJson(response.responseText)
    if (!data[tweetKey])
      return
    const { edges, page_info } = data[tweetKey]
    if (edges.length > 6) {
      started = true
      console.log('started')
    }
    if (!started)
      return
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
          created_at: formatTime(caption.created_at),
          images,
        }
      }).filter(Boolean),
    )
    if (!page_info.has_next_page) {
      const now = (/* @__PURE__ */ new Date()).getTime()
      saveAs(
        { user, tweets },
        `${user == null ? void 0 : user.username}-${now}.json`,
      )
    }
  }
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
      await dealy(800)
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
      const filename = `${formatTime(time)}-${id}${suffix}.jpg`
      await doanload(img, filename)
    }
  }
  _GM_registerMenuCommand('下载媒体', main)
  const enableAllTweets = _GM_getValue('enableAllTweets', false)
  if (enableAllTweets)
    httpHooks([getTweets])
  _GM_registerMenuCommand(
    `导出所有推文 ${enableAllTweets ? '（已启用）' : ''}`,
    () => {
      _GM_setValue('enableAllTweets', !enableAllTweets)
      location.reload()
    },
  )
})()
