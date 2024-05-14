// ==UserScript==
// @name         Chill Script
// @description  Hello! MyScript
// @version      2024.05.14
// @author       Chilfish
// @match        *://*/*
// @grant        GM_addStyle
// @grant        GM_cookie
// @run-at       document-end
// @homepageURL  https://github.com/Chilfish
// @updateURL    https://github.com/Chilfish/Scripts/raw/main/monkey/chilfish.user.js
// @downloadURL  https://github.com/Chilfish/Scripts/raw/main/monkey/chilfish.user.js
// @license      MIT
// ==/UserScript==

window.onload = async function () {
  'use strict'
  let css = ''
  const url = document.URL
  const $ = e => document.querySelector(e)
  const $$ = e => Array.from(document.querySelectorAll(e))

  if (url.includes('msn.com') || url.includes('enet.10000.gd.cn'))
    window.close()

  // 屏蔽视频回答
  if (url.includes('www.zhihu.com')) {
    css += `.VideoAnswerPlayer,.ZVideoItem,.ZVideoItem-video {display: none;}
    .RichContent-EntityWord.css-b8rgjk {color: inherit;cursor: default;}
    .RichContent-EntityWord.css-b8rgjk .css-1dvsrp {display: none;}`
  }
  // 必应搜索的图片结果
  else if (url.includes('bing.com/search')) {
    css += '.b_imgans{display:none;}'

    $('.b_ad').style.display = 'none'
    ;[...$$('.b_algo')].forEach((ele) => {
      if (ele.children[0].tagName === 'H2')
        ele.style.display = 'none'
    })
  }
  // 微博 字体
  else if (url.includes('weibo.com')) {
    css += 'div,p,li,a,span{font-size:12.5px !important;}'
  }

  // 全局：细滚动条
  css += `*::-webkit-scrollbar {width: 8px;height: 8px;}
    *::-webkit-scrollbar-track {border-radius: 8px;background-color: transparent;}
    *::-webkit-scrollbar-thumb {border-radius: 8px;background-color: #7a797963;}

    * {scrollbar-width: thin!important; }
    *,*:focus-visible{outline:none;box-shadow:none;}
    body{overflow-anchor: none;}
  `

  GM_addStyle(css)
}
