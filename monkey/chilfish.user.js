// ==UserScript==
// @name         Chilfish's script
// @namespace    chilfish/monkey
// @version      2024.10.07
// @author       monkey
// @description  Chilfish's script
// @icon         https://unavatar.io/chilfish
// @downloadURL  https://github.com/Chilfish/Scripts/raw/main/monkey/chilfish.user.js
// @updateURL    https://github.com/Chilfish/Scripts/raw/main/monkey/meta/chilfish.meta.js
// @match        *://*/*
// @grant        GM_addStyle
// @run-at       document-end
// ==/UserScript==

(function () {
  'use strict'

  const _GM_addStyle = /* @__PURE__ */ (() => typeof GM_addStyle != 'undefined' ? GM_addStyle : void 0)()
  function $(selector, root) {
    return (root || document).querySelector(selector)
  }
  function $$(selector, root) {
    return Array.from((root || document).querySelectorAll(selector))
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
  function numFmt(num) {
    return num.toString().replace(/\B(?=(\d{4})+(?!\d))/g, ',')
  }
  const bilibili = {
    pattern: /space\.bilibili\.com/,
    action: () => window.addEventListener('load', async () => {
      await waitForElement('.n-fs')
      $('#n-fs').textContent = numFmt($('.n-fs').title.replaceAll(',', ''))
    }),
  }
  const __vite_glob_0_0 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
    __proto__: null,
    default: bilibili,
  }, Symbol.toStringTag, { value: 'Module' }))
  let _baseCss = ``
  function css(strings, ...values) {
    if (!strings.length)
      return
    _baseCss += String.raw(strings, ...values)
  }
  const baseCss = () => _baseCss
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
    },
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
    const module = modules[path].default
    if (module.pattern.test(url)) {
      module.action()
    }
  }
  _GM_addStyle(baseCss())
  Object.assign(window, {
    _$: $,
    _$$: $$,
  })
})()
