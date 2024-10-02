import { $, $$ } from '~/monkey/utils'

function processTweet() {
  const oldElement = $('div[role="link"]')
  if (oldElement) {
    const newElement = oldElement.cloneNode(true)
    oldElement.parentNode?.replaceChild(newElement, oldElement)
  }

  const tweetTexts = $$('div[data-testid="tweetText"]')
    .splice(0, 2)
    .map((div) => {
      div.contentEditable = 'true'
      div.style.removeProperty('-webkit-line-clamp')

      const transBtn = div.nextElementSibling as HTMLElement
      if (transBtn)
        transBtn.style.display = 'none'

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
