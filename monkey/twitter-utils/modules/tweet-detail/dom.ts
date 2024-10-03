import { pubTime, tweetUrl } from '@/utils/common'
import { parseText } from '@/utils/textParser'
import { $, $$, waitForElement } from '~/monkey/utils'
import { formatDate } from '~/utils/date'

function processTweet() {
  const oldElement = $('div[role="link"]')
  if (oldElement) {
    const newElement = oldElement.cloneNode(true)
    oldElement.parentNode?.replaceChild(newElement, oldElement)
  }

  const tweetTexts = $$('div[data-testid="tweetText"]')
    .splice(0, 2)
    .map((div, idx) => {
      div.contentEditable = 'true'
      div.style.removeProperty('-webkit-line-clamp')

      const transBtn = div.nextElementSibling as HTMLElement
      if (transBtn)
        transBtn.style.display = 'none'

      if (idx > 0) {
        const text = div.textContent
        div.innerHTML = parseText(`${text}\n`)
      }

      return div
    })

  const showmore = $('div[data-testid="tweet-text-show-more-link"]')
  if (showmore)
    showmore.style.display = 'none'

  const time = $('a time')!
  // @ts-expect-error it's fine
  time.style = `
    margin-top: 8px;
    color: #536471;
    font-size: 0.9rem;
  `
  tweetTexts[0].parentElement?.appendChild(time.cloneNode(true))
}

export async function editTweet() {
  const isInjected = document.getElementById('edit-tweet') !== null
  if (isInjected)
    return

  const newBtn = document.createElement('button')
  const btn = $('button[data-testid="app-bar-back"]')

  newBtn.textContent = '编辑'
  newBtn.title = '编辑推文'
  newBtn.id = 'edit-tweet'

  // @ts-expect-error it's fine
  newBtn.style = `
    border: none;
    background: none;
    font-size: 1rem;
    margin-left: 6px;
    cursor: pointer;
`
  btn!.parentElement?.parentElement?.appendChild(newBtn)
  newBtn.onclick = processTweet
}

function webArchiveUrl(id: string, name = 'i') {
  return `https://web.archive.org/${tweetUrl(id, name)}`
}

export function viewInArchiver(id: string, name: string) {
  const pub = formatDate(pubTime(id))
  const archiveUrl = webArchiveUrl(id, name)
  console.log(`The main tweet is deleted. Archive: ${archiveUrl}`)

  const text = `发布时间：${pub}\n查看互联网档案馆存档 ↗`

  waitForElement('article span>a').then((node) => {
    const a = node as HTMLAnchorElement
    a.textContent = text.replace(/\n/g, '，')
    a.href = archiveUrl
  })

  waitForElement('div[data-testid="error-detail"] span').then((node) => {
    const a = document.createElement('a')
    a.textContent = text
    a.target = '_blank'

    // @ts-expect-error it's fine
    a.style = `
      color: #1da1f2;
      margin-top: 6px;
      text-decoration: none;
      display: block;
      font-weight: 700;
    `
    a.href = archiveUrl

    node?.append(a)
  })
}
