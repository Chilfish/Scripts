import { pubTime } from '@/utils/common'
import { $, $$, downloader, store } from '~/monkey/utils'
import { formatDate } from '~/utils/date'
import style from './style.css?raw'

const downloadStatus = ['download', 'completed', 'loading', 'failed'] as const
type DownloadStatus = typeof downloadStatus[number]
/**
 * set the status of the button
 */
function setStatus(
  btn: HTMLElement,
  className: DownloadStatus,
) {
  btn.classList.remove(...downloadStatus)
  btn.classList.add(className)
}

const historyKey = 'download_history'
const idHistory = store.get<string[]>(historyKey, [])!
function addHistory(status_id: string) {
  if (idHistory.includes(status_id))
    return

  idHistory.push(status_id)
  store.set(historyKey, idHistory)
}

function detect(node: HTMLElement | null) {
  if (!node)
    return

  const isArticle = node.tagName === 'ARTICLE' || node.tagName === 'DIV'
  const article = isArticle
    ? $('article', node) || node.closest('article')
    : null

  if (article)
    addButtonToArticle(article)

  const isListItems = node.tagName === 'LI' && node.getAttribute('role') === 'listitem' && [node] || node.tagName === 'DIV'
  const listitems = (isListItems
    ? $$('li[role="listitem"] a', node)
    : []) as HTMLAnchorElement[]

  // 里面的图片还是再次动态添加的，得等
  setTimeout(() => listitems.forEach(addButtonToImgs), 1000)
}

function getStatusInfo(item: HTMLAnchorElement | null) {
  if (!item?.href) {
    return {
      statusId: '',
      username: '',
    }
  }

  // /name/status/1234567890
  const paths = new URL(item.href).pathname.split('/').filter(Boolean)
  return {
    statusId: paths[2],
    username: paths[0],
  }
}

function createDownBtn(statusId: string) {
  const downBtnSVG = `<svg viewBox="0 0 24 24" style="width: 18px; height: 18px;"><g class="download"><path d="M3,14 v5 q0,2 2,2 h14 q2,0 2,-2 v-5 M7,10 l4,4 q1,1 2,0 l4,-4 M12,3 v11" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" /></g>
<g class="completed"><path d="M3,14 v5 q0,2 2,2 h14 q2,0 2,-2 v-5 M7,10 l3,4 q1,1 2,0 l8,-11" fill="none" stroke="#1DA1F2" stroke-width="2" stroke-linecap="round" /></g>
<g class="loading"><circle cx="12" cy="12" r="10" fill="none" stroke="#1DA1F2" stroke-width="4" opacity="0.4" /><path d="M12,2 a10,10 0 0 1 10,10" fill="none" stroke="#1DA1F2" stroke-width="4" stroke-linecap="round" /></g>
<g class="failed"><circle cx="12" cy="12" r="11" fill="#f33" stroke="currentColor" stroke-width="2" opacity="0.8" /><path d="M14,5 a1,1 0 0 0 -4,0 l0.5,9.5 a1.5,1.5 0 0 0 3,0 z M12,17 a2,2 0 0 0 0,4 a2,2 0 0 0 0,-4" fill="#fff" stroke="none" /></g></svg>
`

  const downBtn = document.createElement('div')
  const is_exist = idHistory.includes(statusId)
  const downStatus = is_exist ? 'completed' : 'download'

  downBtn.classList.add('tmd-down', downStatus)
  downBtn.innerHTML = `<div><div>${downBtnSVG}</div></div>`

  return downBtn
}

/**
 * add the download button to the article
 * from article list
 */
function addButtonToArticle(article: HTMLElement) {
  if (article.dataset.detected)
    return
  article.dataset.detected = 'true'

  const media_selector = [
    'a[href*="/photo/1"]',
    'a[href="/settings/content_you_see"]', // hidden content
  ]
  const media = $(media_selector.join(','), article)
  // if no media, return
  if (!media)
    return

  const imgLinks = $$<HTMLAnchorElement>('a[href*="/photo/"]', article)
  setTimeout(() => imgLinks.forEach(addButtonToImgs), 1000)

  const { username, statusId } = getStatusInfo(imgLinks[0])

  const status_item = $<HTMLAnchorElement>('a[href*="/status/"]', article)
  const status_id = getStatusInfo(status_item)
  if (!status_id)
    return

  // add the download button to the action bar
  setTimeout(() => {
    const btn_group = $('div[role="group"]:last-of-type, ul.tweet-actions, ul.tweet-detail-actions', article)
    const btn_down = createDownBtn(statusId)
    btn_down.classList.add('tmd-bar-btn')
    btn_group?.appendChild(btn_down)

    const urls = imgLinks
      .map(item => $<HTMLImageElement>('img', item)?.src)
      .filter((url): url is string => !!url)

    btn_down.onclick = (e) => {
      e.preventDefault()
      e.stopPropagation()
      click(btn_down, statusId, urls, username)
    }
  }, 1000)
}

/**
 * add the download button to the image list
 */
function addButtonToImgs(item: HTMLAnchorElement) {
  if (item.dataset.detected)
    return

  const { statusId, username } = getStatusInfo(item)
  const img = $<HTMLImageElement>('img', item)!

  const downBtn = createDownBtn(statusId)
  downBtn.classList.add('tmd-media')
  downBtn.onclick = (e) => {
    e.preventDefault()
    e.stopPropagation()
    click(downBtn, statusId, [img.src], username)
  }
  item.appendChild(downBtn)
  item.dataset.detected = 'true'
}

/**
 * handle the click event of the download button
 */
async function click(
  btn: HTMLElement,
  statusId: string,
  imgUrls: string[],
  userId: string,
) {
  if (btn.classList.contains('loading'))
    return
  setStatus(btn, 'loading')

  imgUrls.forEach((imgUrl: any, idx: number) => {
    const time = pubTime(statusId)
    const formatTime = formatDate(time, 'YYYYMMDD_HHmmss')

    let afterFix = ''
    if (idx > 0)
      afterFix = `-${idx}`

    const name = `${userId}-${formatTime}-${statusId}${afterFix}.png`
    const url = new URL(imgUrl)
    url.search = '?format=png&name=large'

    console.log('download', imgUrl, name)

    downloader.add({
      url: url.href,
      name,
      onload: async () => {
        setStatus(btn, 'completed')
        addHistory(statusId)
      },
      onerror: (result) => {
        setStatus(btn, 'failed')
        console.log('image donwload error', result)
      },
    })
  })
}

export default {
  tagName: 'DIV',
  style,
  action: detect,
}
