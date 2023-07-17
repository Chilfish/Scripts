// ==UserScript==
// @name         Chill Script
// @description  Hello! MyScript
// @version      0.3.5
// @author       Chill Fish
// @match        *://*/*
// @grant        GM_addStyle
// @run-at       document-end
// @homepageURL  https://github.com/Chilfish
// @updateURL    https://raw.githubusercontent.com/Chilfish/Scripts/main/MonkeyScript.js
// @downloadURL  https://raw.githubusercontent.com/Chilfish/Scripts/main/MonkeyScript.js
// @license      MIT
// ==/UserScript==

window.onload = function () {
  'use strict'
  let css = ''
  const url = document.URL
  const $ = e => document.querySelector(e)
  const $$ = e => document.querySelectorAll(e)

  // 禁止外链跳转
  const rm301 = (links, rule = /.+target=/gm) => {
    if (!links[0].href) return
    links.forEach((e) => {
      e.href = decodeURIComponent(e.href).replace(rule, '')
    })
  }

  // 居中、直播列表可滚动
  if (url.includes('t.bilibili.com')) {
    css += `aside section.sticky{top:60px;} aside.right{display:none;} main{margin:0 20px;width:640px;}
    .bili-dyn-live-users__body{overflow: auto;max-height: 550px;scrollbar-color: #fff transparent;margin-top: 8px;}`
  }
  // 删除评论区 关键词搜索的高亮，清除跳转url的垃圾信息
  else if (url.includes('bilibili.com/video')) {
    css += `.reply-warp .reply-item .jump-link.search-word, .reply-warp .reply-item .jump-url-link{color: inherit !important}
      .reply-content-container .reply-content .icon.search-word{display:none !important;}`
    rm301([...$$('a[href*="?spm"]')], /\?.*/gm)
  }
  // 屏蔽视频回答
  else if (url.includes('www.zhihu.com')) {
    css += `.VideoAnswerPlayer,.ZVideoItem,.ZVideoItem-video {display: none;}
    .RichContent-EntityWord.css-b8rgjk {color: inherit;cursor: default;}
    .RichContent-EntityWord.css-b8rgjk .css-1dvsrp {display: none;}`
  }
  // 顶栏别跟着滚
  else if (url.includes('twitter.com')) {
    css += '[aria-label="Home timeline"]>div.r-gtdqiz{position:relative}'
  }
  // 必应搜索的图片结果
  else if (url.includes('bing.com/search')) {
    css += '.b_imgans{display:none;}'

    $('.b_ad').style.display = 'none';
    [...$$('.b_algo')].forEach((ele) => {
      if (ele.children[0].tagName === 'H2')
        ele.style.display = 'none'
    })
  }
  // 微博 字体
  else if (url.includes('weibo.com')) {
    css += 'div,p,li,a,span{font-size:12.5px !important;}'
  }
  // 询问是否要跳转
  else if (!!url.match(/(juejin.cn|zhihu.com)/gm)) {
    const a = [...$('.markdown-body').querySelectorAll('a')]
    rm301(a)
  }

  // 全局：细滚动条
  css += `*::-webkit-scrollbar {width: 8px;height: 8px;}
    *::-webkit-scrollbar-track {border-radius: 8px;background-color: transparent;}
    *::-webkit-scrollbar-thumb {border-radius: 8px;background-color: #7a797963;}

    * {scrollbar-width: thin!important; }
    *,*:focus-visible{outline:none;box-shadow:none;}
    body{overflow-anchor: none;}`

  GM_addStyle(css)
}
