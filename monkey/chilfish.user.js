// ==UserScript==
// @name         Chill Script
// @description  Hello! MyScript
// @version      2024.06.07
// @author       Chilfish
// @match        *://*/*
// @grant        GM_addStyle
// @run-at       document-end
// @homepageURL  https://github.com/Chilfish
// @downloadURL  https://github.com/Chilfish/Scripts/raw/main/monkey/chilfish.user.js
// @updateURL    https://github.com/Chilfish/Scripts/raw/main/monkey/meta/chilfish.meta.js
// @license      MIT
// ==/UserScript==

/* eslint-disable unused-imports/no-unused-vars */

/**
 * @param {string} e
 * @param {any} root
 * @returns {HTMLElement} the first element that matches the specified selector
 */
const $ = (e, root = document) => root.querySelector(e)
/**
 * @param {string} e
 * @param {any} root
 * @returns {HTMLElement[]} array of elements that match the specified selector
 */
const $$ = (e, root = document) => Array.from(root.querySelectorAll(e))

// 配合 https://github.com/pushqrdx/vscode-inline-html 插件来高亮语法
const css = String.raw

let _css = css`
  *::-webkit-scrollbar {
    width: 8px;height: 8px;
  }
  *::-webkit-scrollbar-track {
    border-radius: 8px;background-color: transparent;
  }
  *::-webkit-scrollbar-thumb {
    border-radius: 8px;background-color: #7a797963;
  }
  * {
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

const urlActions = [
  {
    pattern: /msn\.com|enet\.10000\.gd\.cn/,
    action: () => window.close(),
  },
  {
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
  },
  {
    pattern: /weibo\.com/,
    action: () => {
      _css += css`
        div, p, li, a, span {
          font-size:12.5px !important;
        }
      `
    },
  },
  {
    pattern: /https:\/\/(twitter|x)\.com/,
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
        .css-175oi2r.r-184id4b,
        a[aria-label="Premium"],
        a[aria-label="Grok"] {
          display: none !important;
        }
      `
    },
  },
]

window.onload = async function () {
  'use strict'
  const url = document.URL

  urlActions.forEach(({ pattern, action }) => {
    if (pattern.test(url))
      action()
  })

  GM_addStyle(_css)
}
