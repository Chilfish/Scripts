// ==UserScript==
// @name         Chilfish's script
// @namespace    chilfish/monkey
// @version      2024.09.18
// @author       monkey
// @description  Chilfish's script
// @icon         https://unavatar.io/chilfish
// @downloadURL  https://github.com/Chilfish/Scripts/raw/main/monkey/chilfish.user.js
// @updateURL    https://github.com/Chilfish/Scripts/raw/main/monkey/meta/chilfish.meta.js
// @match        *://*/*
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_setValue
// @run-at       document-end
// ==/UserScript==

(function () {
  'use strict'

  const $ = (selector, root = document) => root == null ? void 0 : root.querySelector(selector)
  const $$ = (selector, root = document) => Array.from((root == null ? void 0 : root.querySelectorAll(selector)) || [])
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
  function numFmt(num) {
    return num.toString().replace(/\B(?=(\d{4})+(?!\d))/g, ',')
  }
  const bilibili = {
    pattern: /space\.bilibili\.com/,
    action: () => window.addEventListener('load', async () => {
      await waitForElement('.n-fs', true)
      $('#n-fs').textContent = numFmt($('.n-fs').title.replaceAll(',', ''))
    }),
  }
  const __vite_glob_0_0 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
    __proto__: null,
    default: bilibili,
  }, Symbol.toStringTag, { value: 'Module' }))
  const _GM_addStyle = /* @__PURE__ */ (() => typeof GM_addStyle != 'undefined' ? GM_addStyle : void 0)()
  const _GM_getValue = /* @__PURE__ */ (() => typeof GM_getValue != 'undefined' ? GM_getValue : void 0)()
  const _GM_setValue = /* @__PURE__ */ (() => typeof GM_setValue != 'undefined' ? GM_setValue : void 0)()
  let _baseCss = ``
  function css(strings, ...values) {
    _baseCss += String.raw(strings, ...values)
  }
  const baseCss = () => _baseCss
  const store = {
    get(key) {
      const data = _GM_getValue(key)
      if (!data) {
        this.set(key, null)
        return null
      }
      return data
    },
    set(key, value) {
      _GM_setValue(key, value)
    },
  }
  const twitter = {
    pattern: /(twitter|x)\.com/,
    action() {
      css`
      div, span {
        font-size: 14px !important;
      }
      .css-175oi2r.r-1pi2tsx.r-1wtj0ep.r-1rnoaur.r-o96wvk.r-is05cd {
        width: auto !important; /* left nav item*/
      }
      .css-175oi2r.r-15zivkp.r-1bymd8e.r-13qz1uu {
        max-width: fit-content !important; /* left nav label */
      }

      a[data-testid="jobs-tab-item"],
      a[aria-label="Premium"],
      a[aria-label="Grok"] {
        display: none !important;
      }
  `
      rmRetweet()
      if (isHomepage())
        fixFollows()
    },
  }
  function rmRetweet() {
    const svgWapper = '.css-175oi2r.r-18kxxzh.r-ogg1b9.r-1mrc8m9.r-obd0qt.r-1777fci'
    const whiteList = store.get('whiteList') || []
    const observer = new MutationObserver(ms => ms.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        let _a, _b, _c
        if (mutation.type !== 'childList')
          return
        const el = node
        if (node.nodeType === Node.ELEMENT_NODE && el.tagName === 'DIV') {
          const svg = $(svgWapper, el)
          if (!svg)
            return
          const username = ((_b = (_a = svg.nextElementSibling) == null ? void 0 : _a.textContent) == null ? void 0 : _b.split(' ')[0]) || ''
          if (whiteList.includes(username))
            return;
          (_c = svg.closest('article')) == null ? void 0 : _c.remove()
        }
      })
    }))
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: false,
    })
  }
  function isHomepage() {
    const _url = document.URL.split('/')
    return _url.length === 4 && _url.at(-1) !== 'home'
  }
  async function fixFollows() {
    let _a
    const selector = 'a span.css-1jxf684.r-bcqeeo.r-1ttztb7.r-qvutc0.r-poiln3.r-n6v787.r-1f529hi.r-b88u0q'
    const script = 'script[data-testid="UserProfileSchema-test"]'
    await waitForElement(selector, true)
    await waitForElement(script)
    const data = JSON.parse(((_a = $(script)) == null ? void 0 : _a.textContent) || '{}')
    if (!data.author)
      return
    const follows = data.author.interactionStatistic[0].userInteractionCount
    $$(selector)[1].textContent = numFmt(follows)
  }
  const __vite_glob_0_1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
    __proto__: null,
    default: twitter,
  }, Symbol.toStringTag, { value: 'Module' }))
  const weibo = {
    pattern: /weibo\.com/,
    action: () => {
      css`
      div, p, li, a, span {
        font-size: 12.5px !important;
      }
    `
    },
  }
  const __vite_glob_0_2 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
    __proto__: null,
    default: weibo,
  }, Symbol.toStringTag, { value: 'Module' }))
  const youtube = {
    pattern: /youtube\.com/,
    action: () => {
      css`
      .ytp-gradient-bottom {
        display: none !important;
      }
    `
    },
  }
  const __vite_glob_0_3 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
    __proto__: null,
    default: youtube,
  }, Symbol.toStringTag, { value: 'Module' }))
  const zhihu = {
    pattern: /zhihu\.com/,
    action: () => {
      css`
      .VideoAnswerPlayer, .ZVideoItem, .ZVideoItem-video {
        display: none;
      }
      .RichContent-EntityWord.css-b8rgjk {
        color: inherit;
        cursor: default;
      }
      .RichContent-EntityWord.css-b8rgjk .css-1dvsrp {
        display: none;
      }
    `
    },
  }
  const __vite_glob_0_4 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
    __proto__: null,
    default: zhihu,
  }, Symbol.toStringTag, { value: 'Module' }))
  css`
html::-webkit-scrollbar {
  width: 8px;height: 8px;
}
html::-webkit-scrollbar-track {
  border-radius: 8px;background-color: transparent;
}
html::-webkit-scrollbar-thumb {
  border-radius: 8px;background-color: #7a797963;
}
html {
  scrollbar-width: thin!important;
}
*, *:focus-visible{
  outline:none;
  box-shadow:none;
}
body {
  overflow-anchor: none;
}
:root:where(:lang(zh)) {
  --vp-font-family-base: 'Inter';
}
`
  const url = document.location.href
  const modules = /* @__PURE__ */ Object.assign({
    './modules/bilibili.ts': __vite_glob_0_0,
    './modules/twitter.ts': __vite_glob_0_1,
    './modules/weibo.ts': __vite_glob_0_2,
    './modules/youtube.ts': __vite_glob_0_3,
    './modules/zhihu.ts': __vite_glob_0_4,
  })
  for (const path in modules) {
    const module = modules[path]()
    if (module.pattern.test(url)) {
      module.action()
    }
  }
  _GM_addStyle(baseCss())
})()
