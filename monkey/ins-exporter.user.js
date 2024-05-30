// ==UserScript==
// @name         ins-exporter
// @namespace    chilfish/monkey
// @version      1.0.0
// @author       monkey
// @description  Export Instagram posts
// @icon         https://www.instagram.com/static/images/ico/favicon-192.png/68d99ba29cc8.png
// @downloadURL  https://github.com/Chilfish/Scripts/blob/monkey/ins-exporter.user.js
// @updateURL    https://github.com/Chilfish/Scripts/blob/monkey/ins-exporter.meta.js
// @match        https://www.instagram.com/*
// @grant        unsafeWindow
// ==/UserScript==

(function () {
  'use strict'

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
  function saveAs(data, filename, inline = false) {
    let blob
    if (typeof data === 'string') {
      blob = new Blob([data], { type: 'text/plain' })
    }
    else {
      blob = new Blob(
        [JSON.stringify(data, null, inline ? 0 : 2)],
        { type: 'application/json' },
      )
    }
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
    a.remove()
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
          created_at: caption.created_at,
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
  httpHooks([
    getTweets,
  ])
})()
