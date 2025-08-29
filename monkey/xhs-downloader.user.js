// ==UserScript==
// @name         小红书下载工具
// @namespace    chilfish/monkey
// @version      2.1.1
// @author       JoeanAmier, Chilfish
// @description  提取小红书作品/用户链接，下载小红书无水印图文/视频作品文件
// @license      GNU General Public License v3.0
// @icon         data:image/png;base64,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
// @downloadURL  https://github.com/Chilfish/Scripts/raw/main/monkey/xhs-downloader.user.js
// @updateURL    https://github.com/Chilfish/Scripts/raw/main/monkey/meta/xhs-downloader.meta.js
// @match        http*://xhslink.com/*
// @match        http*://www.xiaohongshu.com/explore*
// @match        http*://www.xiaohongshu.com/user/profile/*
// @match        http*://www.xiaohongshu.com/search_result*
// @match        http*://www.xiaohongshu.com/board/*
// @grant        GM_addStyle
// @grant        GM_deleteValue
// @grant        GM_download
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        unsafeWindow
// @run-at       document-end
// ==/UserScript==

(function () {
  'use strict'

  const _GM_addStyle = (() => typeof GM_addStyle != 'undefined' ? GM_addStyle : void 0)()
  const _GM_deleteValue = (() => typeof GM_deleteValue != 'undefined' ? GM_deleteValue : void 0)()
  const _GM_download = (() => typeof GM_download != 'undefined' ? GM_download : void 0)()
  const _GM_getValue = (() => typeof GM_getValue != 'undefined' ? GM_getValue : void 0)()
  const _GM_setValue = (() => typeof GM_setValue != 'undefined' ? GM_setValue : void 0)()
  const _unsafeWindow = (() => typeof unsafeWindow != 'undefined' ? unsafeWindow : void 0)()
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
  }
  const downloader = (() => {
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
      retryCount++
      if (retryCount === 3)
        activeThreads = 1
      if (task.retry && task.retry >= MAX_RETRY || result.details?.current === 'USER_CANCELED') {
        task.onerror?.(result)
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
          const name = encodeURIComponent(task.name)
          if (isSaveAs) {
            downloadUrl = `https://proxy.chilfish.top/${name}?url=${downloadUrl}`
          }
          return _GM_download({
            url: downloadUrl,
            name,
            saveAs: isSaveAs,
            onload: () => {
              task.onload?.()
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
  const iconBase64 = `data:image/png;base64,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`
  const style = ':root {\n  --primary: #2196f3;\n  --surface: #ffffff;\n  --on-surface: #212121;\n  --ripple-color: rgba(33, 150, 243, 0.15);\n  --border-radius: 12px;\n}\n\n.menu-item {\n  display: flex;\n  padding: 1rem 1.5rem;\n  cursor: pointer;\n  position: relative;\n  transition: all 0.2s ease;\n  align-items: center;\n}\n\n.menu-item:hover {\n  background: var(--ripple-color);\n}\n\n.menu-item:not(:last-child) {\n  border-bottom: 1px solid #eee;\n}\n\n.icon-container {\n  margin-right: 1rem;\n  display: flex;\n  align-items: center;\n}\n\n.material-icons {\n  font-size: 24px;\n  color: var(--primary);\n}\n\n.content {\n  flex: 1;\n}\n\n.title {\n  font-size: 0.95rem;\n  color: var(--on-surface);\n  font-weight: 500;\n  margin-bottom: 2px;\n}\n\n.subtitle {\n  font-size: 0.75rem;\n  color: #757575;\n  line-height: 1.4;\n}\n\n@keyframes slideIn {\n  from {\n    opacity: 0;\n    transform: translateY(10px) scaleY(0.95);\n  }\n  to {\n    opacity: 1;\n    transform: translateY(0) scaleY(1);\n  }\n}\n\n@keyframes slideOut {\n  from {\n    opacity: 1;\n    transform: translateY(0) scaleY(1);\n  }\n  to {\n    opacity: 0;\n    transform: translateY(10px) scaleY(0.95);\n  }\n}\n\n.ripple {\n  position: absolute;\n  border-radius: 50%;\n  transform: scale(0);\n  animation: ripple 0.6s linear;\n  background: var(--ripple-color);\n  pointer-events: none;\n}\n\n@keyframes ripple {\n  to {\n    transform: scale(2);\n    opacity: 0;\n  }\n}\n\n/* 滚动条样式 */\n::-webkit-scrollbar {\n  width: 8px;\n}\n\n::-webkit-scrollbar-track {\n  background: #f1f1f1;\n  border-radius: 10px;\n}\n\n::-webkit-scrollbar-thumb {\n  background: #c1c1c1;\n  border-radius: 10px;\n}\n\n::-webkit-scrollbar-thumb:hover {\n  background: #a8a8a8;\n}\n\n/* 弹窗基础样式 */\n#SettingsOverlay {\n  position: fixed;\n  top: 0;\n  left: 0;\n  width: 100%;\n  height: 100%;\n  background: rgba(0, 0, 0, 0.32);\n  backdrop-filter: blur(4px);\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  z-index: 10000;\n  animation: fadeIn 0.3s;\n}\n\n.optimized-scroll-modal {\n  background: white;\n  border-radius: 16px;\n  width: 380px; /* 缩小窗口宽度 */\n  max-width: 95vw;\n  box-shadow:\n    0 10px 20px rgba(0, 0, 0, 0.19),\n    0 6px 6px rgba(0, 0, 0, 0.23);\n  overflow: hidden;\n  animation: scaleUp 0.3s;\n}\n\n/* 头部样式 */\n.modal-header {\n  padding: 1rem;\n  border-bottom: 1px solid #eee;\n  text-align: center;\n}\n\n.modal-header span {\n  font-size: 1.25rem;\n  font-weight: 500;\n  color: #212121;\n}\n\n/* 内容区域 */\n.modal-body {\n  padding: 1rem; /* 减小内边距 */\n}\n\n/* 设置项样式 */\n.setting-item {\n  margin: 0.5rem 0; /* 减少设置项间距 */\n  padding: 10px;\n  border-radius: 8px;\n  transition: background 0.2s;\n}\n\n.setting-item:hover {\n  background: #f0f0f0;\n}\n\n.setting-item label {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  width: 100%;\n}\n\n/* 设置项标题 */\n.setting-item label span {\n  font-size: 1rem; /* 增大标题文字 */\n  font-weight: 500;\n  color: #333;\n}\n\n/* 开关样式 */\n.toggle-switch {\n  position: relative;\n  width: 40px;\n  height: 20px;\n}\n\n.toggle-switch input {\n  opacity: 0;\n  width: 0;\n  height: 0;\n}\n\n.slider {\n  position: absolute;\n  cursor: pointer;\n  top: 0;\n  left: 0;\n  right: 0;\n  bottom: 0;\n  background: #ccc;\n  transition: 0.4s;\n  border-radius: 34px;\n}\n\n.slider:before {\n  content: \'\';\n  position: absolute;\n  height: 16px;\n  width: 16px;\n  left: 2px;\n  bottom: 2px;\n  background: white;\n  border-radius: 50%;\n  transition: 0.4s;\n}\n\ninput:checked + .slider {\n  background: #2196f3;\n}\n\ninput:checked + .slider:before {\n  transform: translateX(20px);\n}\n\n/* 数值输入 */\n.number-input {\n  display: flex;\n  align-items: center;\n  border: 1px solid #ddd;\n  border-radius: 8px;\n  overflow: hidden;\n  margin: 6px 0;\n}\n\n.number-input input {\n  width: 60px;\n  text-align: center;\n  border: none;\n}\n\n.number-button {\n  padding: 4px 8px;\n  background: #f0f0f0;\n  border: none;\n  cursor: pointer;\n  transition: all 0.2s;\n}\n\n/* 文本输入框 */\n.text-input {\n  width: 100%;\n  padding: 8px;\n  border: 1px solid #ddd;\n  border-radius: 4px;\n  font-size: 0.9rem;\n  margin-top: 8px; /* 增加与标题的距离 */\n  transition: border-color 0.2s;\n}\n\n.text-input:focus {\n  outline: none;\n  border-color: #2196f3;\n  box-shadow: 0 0 4px rgba(33, 150, 243, 0.3);\n}\n\n/* 设置项说明 */\n.setting-description {\n  font-size: 0.875rem;\n  color: #757575;\n  margin-top: 4px;\n  line-height: 1.4;\n  text-align: left; /* 左对齐 */\n}\n\n/* 底部按钮 */\n.modal-footer {\n  padding: 1rem;\n  border-top: 1px solid #eee;\n  display: flex;\n  justify-content: flex-end;\n  gap: 12px;\n}\n\n.primary-btn {\n  background: #2196f3;\n  color: white;\n  padding: 8px 24px;\n  border-radius: 24px;\n  cursor: pointer;\n  transition: all 0.2s;\n}\n\n.secondary-btn {\n  background: #f0f0f0;\n  color: #666;\n  padding: 8px 24px;\n  border-radius: 24px;\n  cursor: pointer;\n  transition: all 0.2s;\n}\n\n/* 动画 */\n@keyframes fadeIn {\n  from {\n    opacity: 0;\n  }\n  to {\n    opacity: 1;\n  }\n}\n\n@keyframes scaleUp {\n  from {\n    transform: scale(0.98);\n  }\n  to {\n    transform: scale(1);\n  }\n}\n\n/* 弹窗基础样式 */\n#imageSelectionOverlay {\n  position: fixed;\n  top: 0;\n  left: 0;\n  width: 100%;\n  height: 100%;\n  background: rgba(0, 0, 0, 0.32);\n  backdrop-filter: blur(4px);\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  z-index: 10000;\n  animation: fadeIn 0.3s;\n}\n\n.image-selection-modal {\n  background: white;\n  border-radius: 16px;\n  width: 80%;\n  max-width: 900px;\n  max-height: 90vh;\n  box-shadow:\n    0 10px 20px rgba(0, 0, 0, 0.19),\n    0 6px 6px rgba(0, 0, 0, 0.23);\n  overflow: hidden;\n  animation: scaleUp 0.3s;\n  display: flex;\n  flex-direction: column;\n}\n\n/* 头部样式 */\n.modal-header {\n  padding: 1rem;\n  border-bottom: 1px solid #eee;\n  text-align: center;\n}\n\n.modal-header span {\n  font-size: 1.25rem;\n  font-weight: 500;\n  color: #212121;\n}\n\n/* 内容区域 */\n.modal-body {\n  flex: 1;\n  padding: 1rem;\n  overflow-y: auto;\n}\n\n/* 图片网格 */\n.image-grid {\n  display: grid;\n  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));\n  gap: 12px;\n}\n\n.image-item {\n  position: relative;\n  border-radius: 8px;\n  overflow: hidden;\n  cursor: pointer;\n  transition: all 0.2s;\n  border: 2px solid transparent;\n}\n\n.image-item img {\n  width: 100%;\n  height: 100px;\n  object-fit: cover;\n  border-radius: 6px;\n}\n\n.image-item.selected {\n  border-color: #2196f3;\n}\n\n.image-checkbox {\n  position: absolute;\n  top: 8px;\n  right: 8px;\n  width: 20px;\n  height: 20px;\n  opacity: 0;\n}\n\n.image-checkbox + label {\n  position: absolute;\n  top: 8px;\n  right: 8px;\n  width: 20px;\n  height: 20px;\n  background: white;\n  border: 1px solid #ccc;\n  border-radius: 50%;\n  cursor: pointer;\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  transition: all 0.2s;\n}\n\n.image-checkbox:checked + label {\n  background: #2196f3;\n  border-color: #2196f3;\n}\n\n.image-checkbox:checked + label::after {\n  content: \'✓\';\n  color: white;\n  font-size: 12px;\n}\n\n/* 底部按钮 */\n.modal-footer {\n  padding: 1rem;\n  border-top: 1px solid #eee;\n  display: flex;\n  justify-content: flex-end;\n  gap: 12px;\n}\n\n.primary-btn {\n  background: #2196f3;\n  color: white;\n  padding: 8px 24px;\n  border-radius: 24px;\n  cursor: pointer;\n  transition: all 0.2s;\n}\n\n.secondary-btn {\n  background: #f0f0f0;\n  color: #666;\n  padding: 8px 24px;\n  border-radius: 24px;\n  cursor: pointer;\n  transition: all 0.2s;\n}\n\n/* 动画 */\n@keyframes fadeIn {\n  from {\n    opacity: 0;\n  }\n  to {\n    opacity: 1;\n  }\n}\n\n@keyframes scaleUp {\n  from {\n    transform: scale(0.98);\n  }\n  to {\n    transform: scale(1);\n  }\n}\n'
  _GM_addStyle(style)
  const config = {
    disclaimer: _GM_getValue('disclaimer', false),
    icon: {
      image: {
        url: iconBase64,
        borderRadius: '50%',
      },
    },
    position: {
      bottom: '8rem',
      left: '2rem',
    },
    animation: {
      duration: 0.35,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
  }
  let currentUrl = ''
  let lastUrl = window.location.href
  function generateVideoUrl(note) {
    try {
      return [`https://sns-video-bd.xhscdn.com/${note.video.consumer.originVideoKey}`]
    }
    catch (error) {
      console.error('Error generating video URL:', error)
      return []
    }
  }
  function generateImageUrl(note) {
    const images = note.imageList
    const regex = /http:\/\/sns-webpic-qc\.xhscdn.com\/\d+\/[0-9a-z]+\/(\S+)!/
    const urls = []
    try {
      images.forEach((item) => {
        const match = item.urlDefault.match(regex)
        if (match && match[1]) {
          urls.push(`https://ci.xiaohongshu.com/${match[1]}?imageView2/format/png`)
        }
      })
      return urls
    }
    catch (error) {
      console.error('Error generating image URLs:', error)
      return []
    }
  }
  function extractImageWebpUrls(note, urls) {
    try {
      const items = []
      const { imageList } = note
      if (urls.length !== imageList.length) {
        console.error('图片数量不一致！')
        return []
      }
      for (const [index, item] of imageList.entries()) {
        if (item.urlDefault) {
          items.push({
            webp: item.urlDefault,
            index: index + 1,
            url: urls[index],
          })
        }
        else {
          console.error('提取图片预览链接失败', item)
          break
        }
      }
      return items
    }
    catch (error) {
      console.error('Error occurred in generating image object:', error)
      return []
    }
  }
  async function download(urls, note) {
    let name = extractName()
    const username = note.user.nickname
    name = `${username} - ${name}`
    console.info(`文件名称 ${name}`, note)
    if (note.type === 'video') {
      await downloadFile(urls[0], `${name}.mp4`)
    }
    else {
      const items = extractImageWebpUrls(note, urls)
      if (items.length === 0) {
        console.error('解析图文作品数据失败', note)
      }
      else if (urls.length > 1) {
        showImageSelectionModal(items, name)
      }
      else {
        await downloadFiles(items, name)
      }
    }
  }
  async function exploreDeal(note) {
    try {
      let links
      if (note.type === 'normal') {
        links = generateImageUrl(note)
      }
      else {
        links = generateVideoUrl(note)
      }
      if (links.length > 0) {
        console.info('下载链接', links)
        await download(links, note)
      }
    }
    catch (error) {
      console.error('Error in exploreDeal function:', error)
    }
  }
  function extractNoteInfo() {
    const regex = /\/explore\/([^?]+)/
    const match = currentUrl.match(regex)
    if (match) {
      return _unsafeWindow.__INITIAL_STATE__.note.noteDetailMap[match[1]]
    }
    else {
      console.error('从链接提取作品 ID 失败', currentUrl)
    }
  }
  async function extractDownloadLinks() {
    if (currentUrl.includes('https://www.xiaohongshu.com/explore/')) {
      const note = extractNoteInfo()
      if (note.note) {
        await exploreDeal(note.note)
      }
    }
  }
  async function downloadFile(link, name) {
    return downloader.add({
      name,
      url: link,
    })
  }
  async function downloadFiles(items, name) {
    const downloadPromises = items.map(async (item) => {
      let fileName
      if (item.index) {
        fileName = `${name}_${item.index}.png`
      }
      else {
        fileName = `${name}.png`
      }
      return downloadFile(item.url, fileName)
    })
    await Promise.all(downloadPromises)
  }
  function truncateString(str, maxLength) {
    if (str.length > maxLength) {
      const halfLength = Math.floor(maxLength / 2) - 1
      return `${str.slice(0, halfLength)}...${str.slice(-halfLength)}`
    }
    return str
  }
  function extractName() {
    let name = document.title.replace(/ - 小红书$/, '').replace(/[^\u4E00-\u9FA5\w ~!@#$%&()\-+=[\];"',.！（）【】：“”，。《》？]/g, '')
    name = truncateString(name, 64)
    const match = currentUrl.match(/\/([^/]+)$/)
    const id = match ? match[1] : null
    return name === '' ? id : name
  }
  function closeImagesModal() {
    const overlay = document.getElementById('imageSelectionOverlay')
    if (overlay) {
      overlay.style.animation = 'fadeOut 0.2s'
      setTimeout(() => overlay.remove(), 200)
    }
  }
  function showImageSelectionModal(imageUrls, name) {
    if (document.getElementById('imageSelectionOverlay')) {
      return
    }
    const overlay = document.createElement('div')
    overlay.id = 'imageSelectionOverlay'
    const modal = document.createElement('div')
    modal.className = 'image-selection-modal'
    const header = document.createElement('div')
    header.className = 'modal-header'
    header.innerHTML = `
            <span>请选中需要下载的图片</span>
        `
    const body = document.createElement('div')
    body.className = 'modal-body'
    const imageGrid = document.createElement('div')
    imageGrid.className = 'image-grid'
    imageUrls.forEach((image) => {
      const item = document.createElement('div')
      item.className = 'image-item'
      const checkbox = document.createElement('input')
      checkbox.type = 'checkbox'
      checkbox.className = 'image-checkbox'
      checkbox.id = `image-checkbox-${image.index}`
      checkbox.checked = true
      const label = document.createElement('label')
      label.htmlFor = `image-checkbox-${image.index}`
      const img = document.createElement('img')
      img.src = image.webp
      img.dataset.index = image.index
      img.dataset.url = image.url
      img.alt = `图片_${image.index}`
      item.appendChild(checkbox)
      item.appendChild(label)
      item.appendChild(img)
      item.addEventListener('click', (e) => {
        if (e.target?.tagName !== 'INPUT') {
          checkbox.checked = !checkbox.checked
          item.classList.toggle('selected', checkbox.checked)
        }
      })
      imageGrid.appendChild(item)
    })
    body.appendChild(imageGrid)
    const footer = document.createElement('div')
    footer.className = 'modal-footer'
    const confirmBtn = document.createElement('button')
    confirmBtn.className = 'primary-btn'
    confirmBtn.textContent = '开始下载'
    const closeBtn = document.createElement('button')
    closeBtn.className = 'secondary-btn'
    closeBtn.textContent = '关闭窗口'
    footer.appendChild(confirmBtn)
    footer.appendChild(closeBtn)
    modal.appendChild(header)
    modal.appendChild(body)
    modal.appendChild(footer)
    overlay.appendChild(modal)
    document.body.appendChild(overlay)
    confirmBtn.addEventListener('click', async () => {
      const selectedImages = Array.from(document.querySelectorAll('.image-checkbox:checked')).map((checkbox) => {
        const item = checkbox.parentElement?.querySelector('img')?.dataset
        return {
          index: item?.index,
          url: item?.url,
        }
      })
      if (selectedImages.length === 0) {
        alert('请至少选择一张图片！')
        return
      }
      closeImagesModal()
      await downloadFiles(selectedImages, name)
    })
    closeBtn.addEventListener('click', closeImagesModal)
    overlay.addEventListener('click', e => e.target === overlay && closeImagesModal())
  }
  function createIcon() {
    const icon2 = document.createElement('div')
    icon2.style = `
    position: fixed;
    bottom: ${config.position.bottom};
    left: ${config.position.left};
    width: 64px;
    height: 64px;
    background: white;
    border-radius: ${config.icon.image.borderRadius};
    cursor: pointer;
    z-index: 9999;
    box-shadow: 0 3px 5px rgba(0,0,0,0.12), 0 3px 5px rgba(0,0,0,0.24);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all ${config.animation.duration}s ${config.animation.easing};
`
    icon2.style.backgroundImage = `url(${config.icon.image.url})`
    icon2.style.backgroundSize = 'cover'
    return icon2
  }
  const menu = document.createElement('div')
  menu.style = `
  position: fixed;
  bottom: calc(${config.position.bottom} + 64px + 1rem);
  left: ${config.position.left};
  width: 255px;
  max-width: calc(100vw - 4rem);
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23);
  overflow: hidden;
  display: none;
  z-index: 9998;
  transform-origin: bottom left;
  opacity: 0;
  transform: translateY(10px) scaleY(0.95);
  will-change: transform, opacity;
`
  const menuContent = document.createElement('div')
  menuContent.style = `
  max-height: 400px;
  overflow-y: auto;
  overscroll-behavior: contain;
`
  menu.appendChild(menuContent)
  const icon = createIcon()
  icon.addEventListener('click', extractDownloadLinks)
  function setupUrlListener() {
    const observeUrl = () => {
      const url = window.location.href
      if (url !== lastUrl) {
        lastUrl = window.location.href
      }
      else {
        currentUrl = url
      }
      requestAnimationFrame(observeUrl)
    }
    observeUrl()
  }
  document.body.appendChild(icon)
  document.body.appendChild(menu)
  setupUrlListener()
})()
