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
  const style = ':root {\r\n  --primary: #2196f3;\r\n  --surface: #ffffff;\r\n  --on-surface: #212121;\r\n  --ripple-color: rgba(33, 150, 243, 0.15);\r\n  --border-radius: 12px;\r\n}\r\n\r\n.menu-item {\r\n  display: flex;\r\n  padding: 1rem 1.5rem;\r\n  cursor: pointer;\r\n  position: relative;\r\n  transition: all 0.2s ease;\r\n  align-items: center;\r\n}\r\n\r\n.menu-item:hover {\r\n  background: var(--ripple-color);\r\n}\r\n\r\n.menu-item:not(:last-child) {\r\n  border-bottom: 1px solid #eee;\r\n}\r\n\r\n.icon-container {\r\n  margin-right: 1rem;\r\n  display: flex;\r\n  align-items: center;\r\n}\r\n\r\n.material-icons {\r\n  font-size: 24px;\r\n  color: var(--primary);\r\n}\r\n\r\n.content {\r\n  flex: 1;\r\n}\r\n\r\n.title {\r\n  font-size: 0.95rem;\r\n  color: var(--on-surface);\r\n  font-weight: 500;\r\n  margin-bottom: 2px;\r\n}\r\n\r\n.subtitle {\r\n  font-size: 0.75rem;\r\n  color: #757575;\r\n  line-height: 1.4;\r\n}\r\n\r\n@keyframes slideIn {\r\n  from {\r\n    opacity: 0;\r\n    transform: translateY(10px) scaleY(0.95);\r\n  }\r\n  to {\r\n    opacity: 1;\r\n    transform: translateY(0) scaleY(1);\r\n  }\r\n}\r\n\r\n@keyframes slideOut {\r\n  from {\r\n    opacity: 1;\r\n    transform: translateY(0) scaleY(1);\r\n  }\r\n  to {\r\n    opacity: 0;\r\n    transform: translateY(10px) scaleY(0.95);\r\n  }\r\n}\r\n\r\n.ripple {\r\n  position: absolute;\r\n  border-radius: 50%;\r\n  transform: scale(0);\r\n  animation: ripple 0.6s linear;\r\n  background: var(--ripple-color);\r\n  pointer-events: none;\r\n}\r\n\r\n@keyframes ripple {\r\n  to {\r\n    transform: scale(2);\r\n    opacity: 0;\r\n  }\r\n}\r\n\r\n/* 滚动条样式 */\r\n::-webkit-scrollbar {\r\n  width: 8px;\r\n}\r\n\r\n::-webkit-scrollbar-track {\r\n  background: #f1f1f1;\r\n  border-radius: 10px;\r\n}\r\n\r\n::-webkit-scrollbar-thumb {\r\n  background: #c1c1c1;\r\n  border-radius: 10px;\r\n}\r\n\r\n::-webkit-scrollbar-thumb:hover {\r\n  background: #a8a8a8;\r\n}\r\n\r\n/* 弹窗基础样式 */\r\n#SettingsOverlay {\r\n  position: fixed;\r\n  top: 0;\r\n  left: 0;\r\n  width: 100%;\r\n  height: 100%;\r\n  background: rgba(0, 0, 0, 0.32);\r\n  backdrop-filter: blur(4px);\r\n  display: flex;\r\n  justify-content: center;\r\n  align-items: center;\r\n  z-index: 10000;\r\n  animation: fadeIn 0.3s;\r\n}\r\n\r\n.optimized-scroll-modal {\r\n  background: white;\r\n  border-radius: 16px;\r\n  width: 380px; /* 缩小窗口宽度 */\r\n  max-width: 95vw;\r\n  box-shadow:\r\n    0 10px 20px rgba(0, 0, 0, 0.19),\r\n    0 6px 6px rgba(0, 0, 0, 0.23);\r\n  overflow: hidden;\r\n  animation: scaleUp 0.3s;\r\n}\r\n\r\n/* 头部样式 */\r\n.modal-header {\r\n  padding: 1rem;\r\n  border-bottom: 1px solid #eee;\r\n  text-align: center;\r\n}\r\n\r\n.modal-header span {\r\n  font-size: 1.25rem;\r\n  font-weight: 500;\r\n  color: #212121;\r\n}\r\n\r\n/* 内容区域 */\r\n.modal-body {\r\n  padding: 1rem; /* 减小内边距 */\r\n}\r\n\r\n/* 设置项样式 */\r\n.setting-item {\r\n  margin: 0.5rem 0; /* 减少设置项间距 */\r\n  padding: 10px;\r\n  border-radius: 8px;\r\n  transition: background 0.2s;\r\n}\r\n\r\n.setting-item:hover {\r\n  background: #f0f0f0;\r\n}\r\n\r\n.setting-item label {\r\n  display: flex;\r\n  justify-content: space-between;\r\n  align-items: center;\r\n  width: 100%;\r\n}\r\n\r\n/* 设置项标题 */\r\n.setting-item label span {\r\n  font-size: 1rem; /* 增大标题文字 */\r\n  font-weight: 500;\r\n  color: #333;\r\n}\r\n\r\n/* 开关样式 */\r\n.toggle-switch {\r\n  position: relative;\r\n  width: 40px;\r\n  height: 20px;\r\n}\r\n\r\n.toggle-switch input {\r\n  opacity: 0;\r\n  width: 0;\r\n  height: 0;\r\n}\r\n\r\n.slider {\r\n  position: absolute;\r\n  cursor: pointer;\r\n  top: 0;\r\n  left: 0;\r\n  right: 0;\r\n  bottom: 0;\r\n  background: #ccc;\r\n  transition: 0.4s;\r\n  border-radius: 34px;\r\n}\r\n\r\n.slider:before {\r\n  content: \'\';\r\n  position: absolute;\r\n  height: 16px;\r\n  width: 16px;\r\n  left: 2px;\r\n  bottom: 2px;\r\n  background: white;\r\n  border-radius: 50%;\r\n  transition: 0.4s;\r\n}\r\n\r\ninput:checked + .slider {\r\n  background: #2196f3;\r\n}\r\n\r\ninput:checked + .slider:before {\r\n  transform: translateX(20px);\r\n}\r\n\r\n/* 数值输入 */\r\n.number-input {\r\n  display: flex;\r\n  align-items: center;\r\n  border: 1px solid #ddd;\r\n  border-radius: 8px;\r\n  overflow: hidden;\r\n  margin: 6px 0;\r\n}\r\n\r\n.number-input input {\r\n  width: 60px;\r\n  text-align: center;\r\n  border: none;\r\n}\r\n\r\n.number-button {\r\n  padding: 4px 8px;\r\n  background: #f0f0f0;\r\n  border: none;\r\n  cursor: pointer;\r\n  transition: all 0.2s;\r\n}\r\n\r\n/* 文本输入框 */\r\n.text-input {\r\n  width: 100%;\r\n  padding: 8px;\r\n  border: 1px solid #ddd;\r\n  border-radius: 4px;\r\n  font-size: 0.9rem;\r\n  margin-top: 8px; /* 增加与标题的距离 */\r\n  transition: border-color 0.2s;\r\n}\r\n\r\n.text-input:focus {\r\n  outline: none;\r\n  border-color: #2196f3;\r\n  box-shadow: 0 0 4px rgba(33, 150, 243, 0.3);\r\n}\r\n\r\n/* 设置项说明 */\r\n.setting-description {\r\n  font-size: 0.875rem;\r\n  color: #757575;\r\n  margin-top: 4px;\r\n  line-height: 1.4;\r\n  text-align: left; /* 左对齐 */\r\n}\r\n\r\n/* 底部按钮 */\r\n.modal-footer {\r\n  padding: 1rem;\r\n  border-top: 1px solid #eee;\r\n  display: flex;\r\n  justify-content: flex-end;\r\n  gap: 12px;\r\n}\r\n\r\n.primary-btn {\r\n  background: #2196f3;\r\n  color: white;\r\n  padding: 8px 24px;\r\n  border-radius: 24px;\r\n  cursor: pointer;\r\n  transition: all 0.2s;\r\n}\r\n\r\n.secondary-btn {\r\n  background: #f0f0f0;\r\n  color: #666;\r\n  padding: 8px 24px;\r\n  border-radius: 24px;\r\n  cursor: pointer;\r\n  transition: all 0.2s;\r\n}\r\n\r\n/* 动画 */\r\n@keyframes fadeIn {\r\n  from {\r\n    opacity: 0;\r\n  }\r\n  to {\r\n    opacity: 1;\r\n  }\r\n}\r\n\r\n@keyframes scaleUp {\r\n  from {\r\n    transform: scale(0.98);\r\n  }\r\n  to {\r\n    transform: scale(1);\r\n  }\r\n}\r\n\r\n/* 弹窗基础样式 */\r\n#imageSelectionOverlay {\r\n  position: fixed;\r\n  top: 0;\r\n  left: 0;\r\n  width: 100%;\r\n  height: 100%;\r\n  background: rgba(0, 0, 0, 0.32);\r\n  backdrop-filter: blur(4px);\r\n  display: flex;\r\n  justify-content: center;\r\n  align-items: center;\r\n  z-index: 10000;\r\n  animation: fadeIn 0.3s;\r\n}\r\n\r\n.image-selection-modal {\r\n  background: white;\r\n  border-radius: 16px;\r\n  width: 80%;\r\n  max-width: 900px;\r\n  max-height: 90vh;\r\n  box-shadow:\r\n    0 10px 20px rgba(0, 0, 0, 0.19),\r\n    0 6px 6px rgba(0, 0, 0, 0.23);\r\n  overflow: hidden;\r\n  animation: scaleUp 0.3s;\r\n  display: flex;\r\n  flex-direction: column;\r\n}\r\n\r\n/* 头部样式 */\r\n.modal-header {\r\n  padding: 1rem;\r\n  border-bottom: 1px solid #eee;\r\n  text-align: center;\r\n}\r\n\r\n.modal-header span {\r\n  font-size: 1.25rem;\r\n  font-weight: 500;\r\n  color: #212121;\r\n}\r\n\r\n/* 内容区域 */\r\n.modal-body {\r\n  flex: 1;\r\n  padding: 1rem;\r\n  overflow-y: auto;\r\n}\r\n\r\n/* 图片网格 */\r\n.image-grid {\r\n  display: grid;\r\n  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));\r\n  gap: 12px;\r\n}\r\n\r\n.image-item {\r\n  position: relative;\r\n  border-radius: 8px;\r\n  overflow: hidden;\r\n  cursor: pointer;\r\n  transition: all 0.2s;\r\n  border: 2px solid transparent;\r\n}\r\n\r\n.image-item img {\r\n  width: 100%;\r\n  height: 100px;\r\n  object-fit: cover;\r\n  border-radius: 6px;\r\n}\r\n\r\n.image-item.selected {\r\n  border-color: #2196f3;\r\n}\r\n\r\n.image-checkbox {\r\n  position: absolute;\r\n  top: 8px;\r\n  right: 8px;\r\n  width: 20px;\r\n  height: 20px;\r\n  opacity: 0;\r\n}\r\n\r\n.image-checkbox + label {\r\n  position: absolute;\r\n  top: 8px;\r\n  right: 8px;\r\n  width: 20px;\r\n  height: 20px;\r\n  background: white;\r\n  border: 1px solid #ccc;\r\n  border-radius: 50%;\r\n  cursor: pointer;\r\n  display: flex;\r\n  justify-content: center;\r\n  align-items: center;\r\n  transition: all 0.2s;\r\n}\r\n\r\n.image-checkbox:checked + label {\r\n  background: #2196f3;\r\n  border-color: #2196f3;\r\n}\r\n\r\n.image-checkbox:checked + label::after {\r\n  content: \'✓\';\r\n  color: white;\r\n  font-size: 12px;\r\n}\r\n\r\n/* 底部按钮 */\r\n.modal-footer {\r\n  padding: 1rem;\r\n  border-top: 1px solid #eee;\r\n  display: flex;\r\n  justify-content: flex-end;\r\n  gap: 12px;\r\n}\r\n\r\n.primary-btn {\r\n  background: #2196f3;\r\n  color: white;\r\n  padding: 8px 24px;\r\n  border-radius: 24px;\r\n  cursor: pointer;\r\n  transition: all 0.2s;\r\n}\r\n\r\n.secondary-btn {\r\n  background: #f0f0f0;\r\n  color: #666;\r\n  padding: 8px 24px;\r\n  border-radius: 24px;\r\n  cursor: pointer;\r\n  transition: all 0.2s;\r\n}\r\n\r\n/* 动画 */\r\n@keyframes fadeIn {\r\n  from {\r\n    opacity: 0;\r\n  }\r\n  to {\r\n    opacity: 1;\r\n  }\r\n}\r\n\r\n@keyframes scaleUp {\r\n  from {\r\n    transform: scale(0.98);\r\n  }\r\n  to {\r\n    transform: scale(1);\r\n  }\r\n}\r\n'
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
