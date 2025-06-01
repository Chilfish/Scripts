// ==UserScript==
// @name         Chilfish's script
// @namespace    chilfish/monkey
// @version      2025.04.02
// @author       monkey
// @description  Chilfish's script
// @icon         https://unavatar.io/chilfish
// @downloadURL  https://github.com/Chilfish/Scripts/raw/main/monkey/chilfish.user.js
// @updateURL    https://github.com/Chilfish/Scripts/raw/main/monkey/meta/chilfish.meta.js
// @match        *://*/*
// @grant        GM_addStyle
// @grant        GM_deleteValue
// @grant        GM_download
// @grant        GM_getValue
// @grant        GM_setValue
// @run-at       document-end
// ==/UserScript==

(function () {
  'use strict'

  let _a
  const _GM_addStyle = /* @__PURE__ */ (() => typeof GM_addStyle != 'undefined' ? GM_addStyle : void 0)()
  const _GM_deleteValue = /* @__PURE__ */ (() => typeof GM_deleteValue != 'undefined' ? GM_deleteValue : void 0)()
  const _GM_download = /* @__PURE__ */ (() => typeof GM_download != 'undefined' ? GM_download : void 0)()
  const _GM_getValue = /* @__PURE__ */ (() => typeof GM_getValue != 'undefined' ? GM_getValue : void 0)()
  const _GM_setValue = /* @__PURE__ */ (() => typeof GM_setValue != 'undefined' ? GM_setValue : void 0)()
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
  };
  (() => {
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
      let _a2, _b
      retryCount++
      if (retryCount === 3)
        activeThreads = 1
      if (task.retry && task.retry >= MAX_RETRY || ((_a2 = result.details) == null ? void 0 : _a2.current) === 'USER_CANCELED') {
        (_b = task.onerror) == null ? void 0 : _b.call(task, result)
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
          const name = task.name
          if (isSaveAs) {
            downloadUrl = `https://proxy.chilfish.top/${name}?url=${downloadUrl}`
          }
          return _GM_download({
            url: downloadUrl,
            name,
            saveAs: isSaveAs,
            onload: () => {
              let _a2;
              (_a2 = task.onload) == null ? void 0 : _a2.call(task)
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
  function numFmt(num) {
    return num.toString().replace(/\B(?=(\d{4})+(?!\d))/g, ',')
  }
  const bilibili = {
    pattern: /space\.bilibili\.com/,
    css: () => css`
  `,
    action: async () => {
      const stats = await waitForElement('.nav-statistics')
      if (!stats)
        return
      const statItems = $$('.nav-statistics__item-num', stats)
      statItems.forEach((item) => {
        const title = item.title
        const num = Number(title.replaceAll(',', ''))
        if (!Number.isNaN(num)) {
          item.textContent = numFmt(num)
        }
      })
    },
  }
  const __vite_glob_0_0 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
    __proto__: null,
    default: bilibili,
  }, Symbol.toStringTag, { value: 'Module' }))
  const meogirl = {
    pattern: /moegirl\.org\.cn/,
    css: () => css`
    .n-notification-container,
    nav#moe-global-toolbar,
    div#moe-article-comments-sidenav-compact,
    ins.adsbygoogle.adsbygoogle-noablate,
    div#aswift_1_host,
    .mwe-popups-container,
    ._01T-L5Cj4R_pdxok9,
    .-WH4kRaZFv_pdxok9,
    .LKiWAjzNmD_pdxok9,
    .X-2JFOXOR1_pdxok9 {
      display: none !important;
      width: 0 !important;
      height: 0 !important;
      opacity: 0 !important;
      visibility: hidden !important;
    }

    body {
      overflow-y: auto !important;
    }
  `,
    action: () => {
      document.addEventListener('click', (e) => {
        const link = e.target.closest('a')
        if (!link)
          return
        const href = link.getAttribute('href')
        if (!href)
          return
        if (href.startsWith('#'))
          return
        e.preventDefault()
        window.open(href, '_blank')
      })
      const ads = $$('ins')
      ads.forEach(ad => ad.remove())
      window.addEventListener('hashchange', () => {
        const ad = $('ins')
        if (ad) {
          ad.remove()
        }
      })
    },
  }
  const __vite_glob_0_1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
    __proto__: null,
    default: meogirl,
  }, Symbol.toStringTag, { value: 'Module' }))
  const twitter = {
    pattern: /(twitter|x)\.com/,
    css: () => css`
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
    a[aria-label="Grok"],
    a[aria-label="Lists"],
    div[aria-label="Analytics"],
    button[aria-label="Grok 操作"] {
      display: none !important;
    }
  `,
    action() {
    },
  }
  const __vite_glob_0_2 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
    __proto__: null,
    default: twitter,
  }, Symbol.toStringTag, { value: 'Module' }))
  const weibo = {
    pattern: /weibo\.com/,
    css: () => css`
    div, p, li, a, span {
      font-size: 12.5px !important;
    }
  `,
    action: () => {
    },
  }
  const __vite_glob_0_3 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
    __proto__: null,
    default: weibo,
  }, Symbol.toStringTag, { value: 'Module' }))
  const youtube = {
    pattern: /youtube\.com/,
    css: () => css`
    .ytp-gradient-bottom {
      display: none !important;
    }
  `,
    action: () => {
    },
  }
  const __vite_glob_0_4 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
    __proto__: null,
    default: youtube,
  }, Symbol.toStringTag, { value: 'Module' }))
  const zhihu = {
    pattern: /zhihu\.com/,
    css: () => css`
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
    `,
    action: () => {
    },
  }
  const __vite_glob_0_5 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
    __proto__: null,
    default: zhihu,
  }, Symbol.toStringTag, { value: 'Module' }))
  const baseCss = css`
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
  _GM_addStyle(baseCss)
  const url = document.location.href
  const modules = /* @__PURE__ */ Object.assign({
    './modules/bilibili.ts': __vite_glob_0_0,
    './modules/meogirl.ts': __vite_glob_0_1,
    './modules/twitter.ts': __vite_glob_0_2,
    './modules/weibo.ts': __vite_glob_0_3,
    './modules/youtube.ts': __vite_glob_0_4,
    './modules/zhihu.ts': __vite_glob_0_5,
  })
  for (const path in modules) {
    const module = modules[path].default
    if (module.pattern.test(url)) {
      module.action()
      _GM_addStyle(((_a = module.css) == null ? void 0 : _a.call(module)) ?? '')
    }
  }
  Object.assign(window, {
    _$: $,
    _$$: $$,
  })
})()
