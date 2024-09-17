// ==UserScript==
// @name         Chill Script
// @description  Hello! MyScript
// @version      2024.09.17
// @author       Chilfish
// @match        *://*/*
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_setValue
// @run-at       document-end
// @homepageURL  https://github.com/Chilfish
// @downloadURL  https://github.com/Chilfish/Scripts/raw/main/monkey/chilfish.user.js
// @updateURL    https://github.com/Chilfish/Scripts/raw/main/monkey/meta/chilfish.meta.js
// @license      MIT
// ==/UserScript==

// 好像越来越长了，得分模块了

/**
 * @param {string} e
 * @param {any} root
 * @returns {HTMLElement | null} the first element that matches the specified selector
 */
const $ = (e, root = document) => root?.querySelector(e)
/**
 * @param {string} e
 * @param {any} root
 * @returns {HTMLElement[]} array of elements that match the specified selector
 */
const $$ = (e, root = document) => Array.from(root?.querySelectorAll(e)).filter(Boolean)

// 配合 https://github.com/pushqrdx/vscode-inline-html 插件来高亮语法
let baseCss = ``
function css(strings, ...values) {
  baseCss += String.raw(strings, ...values)
}

let baseHtml = ``
function html(strings, ...values) {
  baseHtml += String.raw(strings, ...values)
}

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

const store = {
  get(key) {
    const data = GM_getValue(key)
    if (!data) {
      this.set(key, null)
      return null
    }
    return data
  },
  set(key, value) {
    GM_setValue(key, value)
  },
}

/**
 * @typedef UrlAction {pattern: RegExp, action: () => any}
 */

/**
 * @typedef {UrlAction[]} urlAction
 */
const urlActions = [{
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
}, {
  pattern: /weibo\.com/,
  action: () => {
    css`
      div, p, li, a, span {
        font-size: 12.5px !important;
      }
    `
  },
}, {
  pattern: /(twitter|x)\.com/,
  action: async () => {
    $('link[rel=\'shortcut icon\']').href = 'https://abs.twimg.com/favicons/twitter.ico'
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

    const isHomepage = (() => {
      const _url = document.URL.split('/')
      return _url.length === 4 && _url.at(-1) !== 'home'
    })()

    if (isHomepage) {
      const selector = 'a span.css-1jxf684.r-bcqeeo.r-1ttztb7.r-qvutc0.r-poiln3.r-n6v787.r-1f529hi.r-b88u0q'
      const script = 'script[data-testid="UserProfileSchema-test"]'
      await waitForElement(selector, true)
      await waitForElement(script)

      const data = JSON.parse($(script).textContent)
      const follows = data.author.interactionStatistic[0].userInteractionCount

      $$(selector)[1].textContent = numFmt(follows)
    }
  },
}, {
  pattern: /youtube\.com/,
  action: () => {
    css`
      .ytp-gradient-bottom {
        display: none !important;
      }
    `
  },
}, {
  pattern: /space\.bilibili\.com/,
  action: async () => {
    await waitForElement('.n-fs', true)

    $('#n-fs').textContent = numFmt($('.n-fs').title.replaceAll(',', ''))
  },
}]

// 用于格式化数字, 1,000,000 => 100,0000
function numFmt(num) {
  return num.toString().replace(/\B(?=(\d{4})+(?!\d))/g, ',')
}

// TODO: 加一个config列表来指定博主
function rmRetweet() {
  const svgWapper = '.css-175oi2r.r-18kxxzh.r-ogg1b9.r-1mrc8m9.r-obd0qt.r-1777fci'
  // const retweetSvg = `svg.r-4qtqp9.r-yyyyoo.r-dnmrzs.r-bnwqim.r-lrvibr.r-m6rgpd.r-14j79pv.r-1pexk7n.r-1mcorv5`
  /**
   * @type {string[]}
   */
  const whiteList = store.get('whiteList') || []

  const observer = new MutationObserver(ms => ms.forEach((mutation) => {
    mutation.addedNodes.forEach((node) => {
      if (mutation.type !== 'childList')
        return

      if (
        node.nodeType === Node.ELEMENT_NODE
        && node.tagName === 'DIV'
      ) {
        const svg = $(svgWapper, node)
        if (!svg)
          return

        const username = svg.nextElementSibling.textContent.split(' ')[0]
        if (whiteList.includes(username))
          return

        svg.closest('article').remove()
      }
    })
  }))

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: false,
  })
}

/**
 * Wait for an element to be added to the DOM.
 */
function waitForElement(
  selector,
  textContent = false,
) {
  return new Promise((resolve) => {
    function got(el) {
      if (textContent && el.textContent)
        resolve(el)
      return resolve(el)
    }

    const el = $(selector)
    if (el) {
      got(el)
      return
    }

    const observer = new MutationObserver(() => {
      const el = $(selector)
      if (el) {
        observer.disconnect()
        got(el)
      }
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: false,
    })
  })
}

window.onload = async function () {
  'use strict'
  const url = document.URL

  urlActions.forEach(({ pattern, action }) => {
    if (pattern.test(url))
      action()
  })

  GM_addStyle(baseCss)
}
