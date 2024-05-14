// ==UserScript==
// @name         Chill Script
// @description  Hello! MyScript
// @version      2024.05.15
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
const $ = e => document.querySelector(e)
const $$ = e => Array.from(document.querySelectorAll(e))
const css = String.raw

let CSS = css`
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
      CSS += css`
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
      CSS += css` 
        div, p, li, a, span {
          font-size:12.5px !important;
        }
      `
    },
  },
  {
    pattern: /twitter\.com/,
    action: () => {
      CSS += css`
        div, span {
          font-size: 14px !important;
        }
        .css-175oi2r.r-1pi2tsx.r-1wtj0ep.r-1rnoaur.r-o96wvk.r-is05cd {
          width: auto !important; /* left nav item*/
        }
        .css-175oi2r.r-15zivkp.r-1bymd8e.r-13qz1uu {
          max-width: fit-content !important; /* left nav label */
        }
        .css-175oi2r.r-184id4b {
          display: none !important; /* left profile avatar */
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

  GM_addStyle(CSS)
}
