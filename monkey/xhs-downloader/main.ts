import { GM_addStyle, GM_getValue, unsafeWindow } from '$'
import { downloader } from '~/utils/monkey'
import { iconBase64 } from './constants'
import style from './style.css?raw'

GM_addStyle(style)

const config = {
  disclaimer: GM_getValue('disclaimer', false),
  fileNameFormat: undefined,
  imageFileFormat: undefined,
  icon: {
    type: 'image', // 可选: image/svg/font
    image: {
      url: iconBase64, // 图片URL或Base64
      size: 64, // 图标尺寸
      borderRadius: '50%', // 形状（50%为圆形）
    },
  }, // 位置配置
  position: {
    bottom: '8rem',
    left: '2rem',
  },
  animation: {
    duration: 0.35, // 动画时长(s)
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
}

let currentUrl = ''
let lastUrl = window.location.href

function generateVideoUrl(note: any) {
  try {
    return [`https://sns-video-bd.xhscdn.com/${note.video.consumer.originVideoKey}`]
  }
  catch (error) {
    console.error('Error generating video URL:', error)
    return []
  }
}

function generateImageUrl(note: any) {
  const images = note.imageList
  const regex = /http:\/\/sns-webpic-qc\.xhscdn.com\/\d+\/[0-9a-z]+\/(\S+)!/
  const urls: string[] = []
  try {
    images.forEach((item: any) => {
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

function extractImageWebpUrls(note: any, urls: string[]) {
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

async function download(urls: string[], note: any) {
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

async function exploreDeal(note: any) {
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
    return unsafeWindow.__INITIAL_STATE__.note.noteDetailMap[match[1]]
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

async function downloadFile(
  link: string,
  name: string,
) {
  return downloader.add({
    name,
    url: link,
  })
}

async function downloadFiles(items: any[], name: string) {
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

function truncateString(str: string, maxLength: number) {
  if (str.length > maxLength) {
    const halfLength = Math.floor(maxLength / 2) - 1 // 减去 1 留出省略号的空间
    return `${str.slice(0, halfLength)}...${str.slice(-halfLength)}`
  }
  return str
}

function extractName() {
  let name = document.title
    .replace(/ - 小红书$/, '')
    .replace(/[^\u4E00-\u9FA5\w ~!@#$%&()\-+=[\];"',.！（）【】：“”，。《》？]/g, '')
  name = truncateString(name, 64)
  const match = currentUrl.match(/\/([^/]+)$/)
  const id = match ? match[1] : null
  return name === '' ? id : name
}

// 关闭弹窗函数
function closeImagesModal() {
  const overlay = document.getElementById('imageSelectionOverlay')
  if (overlay) {
    overlay.style.animation = 'fadeOut 0.2s'
    setTimeout(() => overlay.remove(), 200)
  }
}

/* ==================== 弹窗逻辑 ==================== */
function showImageSelectionModal(imageUrls: any[], name: string) {
  if (document.getElementById('imageSelectionOverlay')) {
    return
  }

  // 创建覆盖层
  const overlay = document.createElement('div')
  overlay.id = 'imageSelectionOverlay'

  // 创建弹窗
  const modal = document.createElement('div')
  modal.className = 'image-selection-modal'

  // 创建头部
  const header = document.createElement('div')
  header.className = 'modal-header'
  header.innerHTML = `
            <span>请选中需要下载的图片</span>
        `

  // 创建内容区域
  const body = document.createElement('div')
  body.className = 'modal-body'

  // 创建图片网格
  const imageGrid = document.createElement('div')
  imageGrid.className = 'image-grid'

  // 动态生成图片项
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

    // 绑定点击事件
    item.addEventListener('click', (e) => {
      if ((e.target as HTMLElement)?.tagName !== 'INPUT') {
        checkbox.checked = !checkbox.checked
        item.classList.toggle('selected', checkbox.checked)
      }
    })

    imageGrid.appendChild(item)
  })

  body.appendChild(imageGrid)

  // 创建底部按钮
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

  // 组装弹窗
  modal.appendChild(header)
  modal.appendChild(body)
  modal.appendChild(footer)
  overlay.appendChild(modal)
  document.body.appendChild(overlay)

  // 确认事件
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

  // 关闭事件
  closeBtn.addEventListener('click', closeImagesModal)
  overlay.addEventListener('click', e => e.target === overlay && closeImagesModal())
}

// 创建主图标
function createIcon() {
  const icon = document.createElement('div')
  icon.style = `
    position: fixed;
    bottom: ${config.position.bottom};
    left: ${config.position.left};
    width: 64px;
    height: 64px;
    background: white;
    border-radius: ${config.icon.image.borderRadius || '8px'};
    cursor: pointer;
    z-index: 9999;
    box-shadow: 0 3px 5px rgba(0,0,0,0.12), 0 3px 5px rgba(0,0,0,0.24);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all ${config.animation.duration}s ${config.animation.easing};
`

  icon.style.backgroundImage = `url(${config.icon.image.url})`
  icon.style.backgroundSize = 'cover'

  return icon
}

// 创建菜单容器
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

// 创建菜单内容容器
const menuContent = document.createElement('div')
menuContent.style = `
  max-height: 400px;
  overflow-y: auto;
  overscroll-behavior: contain;
`
menu.appendChild(menuContent)

// 事件监听
const icon = createIcon()
icon.addEventListener('click', extractDownloadLinks)

// URL变化监听
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

// 添加到页面
document.body.appendChild(icon)
document.body.appendChild(menu)
setupUrlListener()
