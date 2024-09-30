import { $, $$ } from '../../../utils'

function processTweet() {
  const oldElement = $('div[role="link"]')
  if (oldElement) {
    const newElement = oldElement.cloneNode(true)
    oldElement.parentNode?.replaceChild(newElement, oldElement)
  }

  $$('div[data-testid="tweetText"]').splice(0, 2).forEach((div) => {
    div.contentEditable = 'true'
    div.style.removeProperty('-webkit-line-clamp')

    const transBtn = div.nextElementSibling as HTMLElement
    if (transBtn)
      transBtn.style.display = 'none'
  })
  const showmore = $('div[data-testid="tweet-text-show-more-link"]')
  if (showmore)
    showmore.style.display = 'none'
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
