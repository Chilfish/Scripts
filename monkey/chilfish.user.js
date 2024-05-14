// ==UserScript==
// @name         Chill Script
// @description  Hello! MyScript
// @version      0.3.5
// @author       Chill Fish
// @match        *://*/*
// @grant        GM_addStyle
// @grant        GM_cookie
// @run-at       document-end
// @homepageURL  https://github.com/Chilfish
// @updateURL    https://raw.githubusercontent.com/Chilfish/Scripts/main/MonkeyScript.js
// @downloadURL  https://raw.githubusercontent.com/Chilfish/Scripts/main/MonkeyScript.js
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

  // 居中、直播列表可滚动
  if (url.includes('t.bilibili.com')) {
    css += `aside section.sticky{top:60px;} aside.right{display:none;} main{margin:0 20px;width:640px;}
    .bili-dyn-live-users__body{overflow: auto;max-height: 550px;scrollbar-color: #fff transparent;margin-top: 8px;}`
  }
  // 删除评论区 关键词搜索的高亮
  else if (url.includes('bilibili.com/video')) {
    css += `.reply-warp .reply-item .jump-link.search-word, .reply-warp .reply-item .jump-url-link{color: inherit !important}
      .reply-content-container .reply-content .icon.search-word{display:none !important;}`
  }
  // 屏蔽视频回答
  else if (url.includes('www.zhihu.com')) {
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
  else if (url.includes('gitbooks.io') || url.includes('segmentfault.com')) {
    css += `@media (prefers-color-scheme: dark) {
      html { filter: invert(1) hue-rotate(180deg); }
      html img, html video { filter: invert(1) hue-rotate(180deg); }
    }`
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
