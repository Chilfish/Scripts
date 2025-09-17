// ==UserScript==
// @name         Instagram Exporter
// @namespace    chilfish/monkey
// @version      2025.09.17
// @author       Chilfish
// @description  Export Instagram posts
// @icon         https://www.instagram.com/static/images/ico/favicon-192.png/68d99ba29cc8.png
// @downloadURL  https://github.com/Chilfish/Scripts/raw/main/monkey/ins-exporter.user.js
// @updateURL    https://github.com/Chilfish/Scripts/raw/main/monkey/meta/ins-exporter.meta.js
// @match        https://www.instagram.com/*
// @grant        unsafeWindow
// ==/UserScript==

(function () {
  'use strict'

  const _unsafeWindow = (() => typeof unsafeWindow != 'undefined' ? unsafeWindow : void 0)()
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
    if (value[0] === '"' && value[value.length - 1] === '"' && !value.includes('\\')) {
      return value.slice(1, -1)
    }
    const _value = value.trim()
    if (_value.length <= 9) {
      switch (_value.toLowerCase()) {
        case 'true': {
          return true
        }
        case 'false': {
          return false
        }
        case 'undefined': {
          return void 0
        }
        case 'null': {
          return null
        }
        case 'nan': {
          return Number.NaN
        }
        case 'infinity': {
          return Number.POSITIVE_INFINITY
        }
        case '-infinity': {
          return Number.NEGATIVE_INFINITY
        }
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
  function ins2Tweet(data) {
    const createdAt = new Date(data.createdAt).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: 'Asia/Shanghai',
    })
    return {
      id: data.id,
      tweetId: data.shortcode,
      userId: data.author.username,
      createdAt,
      fullText: data.caption,
      media: data.media,
      retweetCount: 0,
      quoteCount: 0,
      replyCount: data.commentCount,
      favoriteCount: data.likeCount,
      viewsCount: 0,
      retweetedStatus: null,
      quotedStatus: null,
    }
  }
  const urlMatch = 'graphql/query'
  const tweetKey = 'xdt_api__v1__feed__user_timeline_graphql_connection'
  let user
  const insDataList = []
  const getTweets = (request, response) => {
    if (!request.url.includes(urlMatch))
      return
    const { data } = destr(response.responseText)
    if (!data[tweetKey])
      return
    const { edges, page_info } = data[tweetKey]
    console.log('fetched:', insDataList.length)
    edges.forEach(({ node }) => {
      const { code, caption, owner, carousel_media, image_versions2, like_count, comment_count } = node
      if (!caption)
        return
      if (insDataList.some(item => item.id === code)) {
        return
      }
      let media = carousel_media?.map(({ image_versions2: image_versions22 }) => ({
        type: 'image',
        url: image_versions22.candidates[0].url,
        width: image_versions22.candidates[0].width,
        height: image_versions22.candidates[0].height,
      }))
      if (!media) {
        media = [{
          type: 'image',
          url: image_versions2.candidates[0].url,
          width: image_versions2.candidates[0].width,
          height: image_versions2.candidates[0].height,
        }]
      }
      user = {
        username: owner.username,
        full_name: owner.full_name,
        profile_pic_url: owner.profile_pic_url,
      }
      const insData = {
        id: code,
        shortcode: code,
        url: `https://www.instagram.com/p/${code}/`,
        author: {
          id: owner.id || owner.username,
          username: owner.username,
          fullName: owner.full_name,
          avatarUrl: owner.profile_pic_url,
        },
        caption: caption.text,
        createdAt: formatDate(caption.created_at),
        likeCount: like_count || 0,
        commentCount: comment_count || 0,
        media,
      }
      insDataList.push(insData)
    })
  }
  function getCollectedDataCount() {
    return insDataList.length
  }
  function exportCollectedData() {
    if (insDataList.length === 0) {
      alert('暂无数据可导出')
      return
    }
    const curUid = user?.username || 'unknown'
    const tweetDataList = insDataList.map(ins2Tweet).filter(tweet => tweet.userId === curUid)
    const now = (new Date()).getTime()
    saveAs(
      tweetDataList,
      `${user?.username}-tweets-${now}.json`,
    )
    const mediaLinks = tweetDataList.flatMap(tweet => tweet.media.map(media => media.url))
    saveAs(
      mediaLinks.join('\n'),
      `${user?.username}-media-links-${now}.txt`,
    )
    console.log(`导出了 ${tweetDataList.length} 条数据`)
  }
  const modules = [
    getTweets,
  ]
  function createExportButton() {
    const button = document.createElement('button')
    button.innerHTML = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.89 22 5.99 22H18C19.1 22 20 21.1 20 20V8L14 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <polyline points="14,2 14,8 20,8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <polyline points="10,9 9,9 8,9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `
    button.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 9999;
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: #1976d2;
    color: white;
    border: none;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: bold;
    transition: all 0.3s ease;
    gap: 2px;
  `
    button.addEventListener('mouseenter', () => {
      button.style.transform = 'scale(1.1)'
      button.style.boxShadow = '0 6px 16px rgba(0,0,0,0.2)'
    })
    button.addEventListener('mouseleave', () => {
      button.style.transform = 'scale(1)'
      button.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'
    })
    button.addEventListener('click', () => {
      const count = getCollectedDataCount()
      if (count === 0) {
        alert('暂无数据可导出')
        return
      }
      if (confirm(`确定要导出 ${count} 条数据吗？`)) {
        exportCollectedData()
      }
    })
    document.body.appendChild(button)
  }
  httpHooks(modules)
  createExportButton()
  console.debug('ins-export loaded')
})()
