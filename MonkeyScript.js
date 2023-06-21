// ==UserScript==
// @name         FishScript
// @version      0.3.1
// @author       Chill Fish
// @updateURL    https://raw.fastgit.org/Chilfish/FishCode/main/Web/MonkeyScript.js
// @downloadURL  https://raw.fastgit.org/Chilfish/FishCode/main/Web/MonkeyScript.js
// @icon         https://raw.fastgit.org/Chilfish/FishCode/main/Web/static/img/fish.png
// @match        *://*/*
// @grant        GM_addStyle
// @run-at       document-idle
// @homepageURL  https://github.com/Chilfish
// ==/UserScript==

(function () {
  'use strict';
  let css = '';
  const url = document.URL;
  const $ = (e) => document.querySelector(e);
  const $$ = (e) => document.querySelectorAll(e);

  // 居中、直播列表可滚动
  if (url.includes('t.bilibili.com')) {
    css += `aside section.sticky{top:60px;} aside.right{display:none;} main{margin:0 20px;width:640px;}
    .bili-dyn-live-users__body{overflow: auto;max-height: 550px;scrollbar-color: #fff transparent;margin-top: 8px;}`;
  }
  // 删除评论区 关键词搜索的高亮
  else if (url.includes('bilibili.com/video')) {
    css += `.reply-warp .reply-item .jump-link.search-word, .reply-warp .reply-item .jump-url-link{color: inherit !important}
      .reply-content-container .reply-content .icon.search-word{display:none !important;}`;
  }
  // 屏蔽视频回答
  else if (url.includes('www.zhihu.com')) {
    css += `.VideoAnswerPlayer,.ZVideoItem,.ZVideoItem-video {display: none;}
    .RichContent-EntityWord.css-b8rgjk {color: inherit;cursor: default;}
    .RichContent-EntityWord.css-b8rgjk .css-1dvsrp {display: none;}`;
  }
  // 顶栏别跟着滚
  else if (url.includes('twitter.com')) {
    css += `[aria-label="Home timeline"]>div.r-gtdqiz{position:relative}`;
  }

  // 全局：细滚动条
  css += `*::-webkit-scrollbar {width: 8px;height: 8px;}
    *::-webkit-scrollbar-track {border-radius: 8px;background-color: transparent;}
    *::-webkit-scrollbar-thumb {border-radius: 8px;background-color: #7a797963;}

    * {scrollbar-width: thin!important; }
    *,*:focus-visible{outline:none;box-shadow:none;}
    body{overflow-anchor: none;}`;

  GM_addStyle(css);
})();
