// ==UserScript==
// @name         Chill Script
// @description  Hello! MyScript
// @version      0.4.0
// @author       Chill Fish
// @match        *://*/*
// @grant        GM_addStyle
// @run-at       document-end
// @homepageURL  https://github.com/Chilfish
// @updateURL    https://raw.githubusercontent.com/Chilfish/Scripts/main/MonkeyScript.js
// @downloadURL  https://raw.githubusercontent.com/Chilfish/Scripts/main/MonkeyScript.js
// @license      MIT
// ==/UserScript==

;(function () {
  'use strict'
  let css = ''
  const url = document.URL
  function waitForElement(selector, $ = (e) => document.querySelector(e)) {
    return new Promise((resolve) => {
      if ($(selector)) return resolve($(selector))

      const observer = new MutationObserver(() => {
        if ($(selector)) {
          resolve($(selector))
          observer.disconnect()
        }
      })

      observer.observe(document.body, {
        childList: true,
        subtree: true,
      })
    })
  }

  const urlStyle = {
    't.bilibili.com': `aside section.sticky{top:60px;} aside.right{display:none;} main{margin:0 20px;width:640px;} .bili-dyn-live-users__body{overflow: auto;max-height: 550px;scrollbar-color: #ffffff transparent;margin-top: 8px;}`,

    'twitter.com': '[aria-label="Home timeline"]>div.r-gtdqiz{position:relative}',

    'weibo.com': 'div,p,li,a,span{font-size:12.5px !important;}',

    'jianshu.com': `div._3VRLsv div._gp-ck {width: 100%;}`,
  }

  Object.keys(urlStyle).forEach((key) => {
    if (url.includes(key)) return (css = urlStyle[key])
  })

  // 全局：细滚动条
  css += `*::-webkit-scrollbar {width: 8px;height: 8px;}
    *::-webkit-scrollbar-track {border-radius: 8px;background-color: transparent;}
    *::-webkit-scrollbar-thumb {border-radius: 8px;background-color: #7a797963;}

    * {scrollbar-width: thin!important; }
    *,*:focus-visible{outline:none;box-shadow:none;}
    body{overflow-anchor: none;}`

  GM_addStyle(css)
})()
