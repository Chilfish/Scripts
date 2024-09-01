// ==UserScript==
// @name         Chill Script
// @description  Hello! MyScript
// @version      2024.08.25
// @author       Chilfish
// @match        *://*/*
// @grant        GM_addStyle
// @run-at       document-end
// @homepageURL  https://github.com/Chilfish
// @downloadURL  https://github.com/Chilfish/Scripts/raw/main/monkey/chilfish.user.js
// @updateURL    https://github.com/Chilfish/Scripts/raw/main/monkey/meta/chilfish.meta.js
// @license      MIT
// ==/UserScript==

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
const css = String.raw
const html = String.raw

let _css = css`
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
`

/**
 * @typedef UrlAction {pattern: RegExp, action: () => void}
 */

/**
 * @typedef {UrlAction[]} urlAction
 */
const urlActions = [{
  pattern: /zhihu\.com/,
  action: () => {
    _css += css`
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
    _css += css`
      div, p, li, a, span {
        font-size: 12.5px !important;
      }
    `
  },
}, {
  pattern: /(twitter|x)\.com/,
  action: () => {
    $('link[rel=\'shortcut icon\']').href = 'https://abs.twimg.com/favicons/twitter.ico'
    _css += css`
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
  },
}]

function rmRetweet() {
  function _rmRetweet(article) {
    const retweetSvg = `svg.r-4qtqp9.r-yyyyoo.r-dnmrzs.r-bnwqim.r-lrvibr.r-m6rgpd.r-14j79pv.r-10ptun7.r-1janqcz`
    const isRetweet = $(retweetSvg, article)
    if (isRetweet) {
      article.remove()
    }
  }

  function isHomepage() {
    const _url = document.URL.split('/')
    return _url.length === 4 && _url.at(-1) !== 'home'
  }

  const observer = new MutationObserver(ms => ms.forEach((mutation) => {
    if (isHomepage()) {
      return
    }

    mutation.addedNodes.forEach((node) => {
      if (node.nodeType === 1 && node.tagName === 'DIV') {
        const article = $(`article`, node)
        if (article) {
          _rmRetweet(article)
        }
      }
    })
  }))

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  })
}

window.onload = async function () {
  'use strict'
  const url = document.URL

  urlActions.forEach(({ pattern, action }) => {
    if (pattern.test(url))
      action()
  })

  GM_addStyle(_css)
}
