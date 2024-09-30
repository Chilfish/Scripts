import { $, $$, waitForElement } from '~/monkey/utils'
import { numFmt } from '~/utils/math'
import { UrlActions } from '../types'
import { css, store } from '../utils'

export default {
  pattern: /(twitter|x)\.com/,
  action() {
    css`
      div, span {
        font-size: 14px !important;
        font-family: 'Microsoft YaHei' !important;
      }
      .css-175oi2r.r-1pi2tsx.r-1wtj0ep.r-1rnoaur.r-o96wvk.r-is05cd {
        width: auto !important; /* left nav item*/
      }
      .css-175oi2r.r-15zivkp.r-1bymd8e.r-13qz1uu {
        max-width: fit-content !important; /* left nav label */
      }

      a[data-testid="jobs-tab-item"],
      a[aria-label="Premium"],
      a[aria-label="Grok"] {
        display: none !important;
      }
  `

    rmRetweet()

    waitForElement('div[data-testid="inline_reply_offscreen"]', true).then(() => {
      setTimeout(() => scrollTo({
        top: 2000,
        behavior: 'smooth',
      }), 1000)
      setTimeout(editTweet, 2000)
    })

    if (isHomepage())
      fixFollows()
  },
} satisfies UrlActions

// TODO: 加一个config列表来指定博主
function rmRetweet() {
  const svgWapper = '.css-175oi2r.r-18kxxzh.r-ogg1b9.r-1mrc8m9.r-obd0qt.r-1777fci'

  const whiteList = store.get<string[]>('whiteList') || []

  const observer = new MutationObserver(ms => ms.forEach((mutation) => {
    mutation.addedNodes.forEach((node) => {
      if (mutation.type !== 'childList')
        return

      const el = node as HTMLElement
      if (
        node.nodeType === Node.ELEMENT_NODE
        && el.tagName === 'DIV'
      ) {
        const svg = $(svgWapper, el)
        if (!svg)
          return

        const username = svg.nextElementSibling?.textContent?.split(' ')[0] || ''
        if (whiteList.includes(username))
          return

        svg.closest('article')?.remove()
      }
    })
  }))

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: false,
  })
}

function isHomepage() {
  const _url = document.URL.split('/')
  return _url.length === 4 && _url.at(-1) !== 'home'
}

async function fixFollows() {
  const selector = 'a span.css-1jxf684.r-bcqeeo.r-1ttztb7.r-qvutc0.r-poiln3.r-n6v787.r-1f529hi.r-b88u0q'
  const script = 'script[data-testid="UserProfileSchema-test"]'
  await waitForElement(selector, true)
  await waitForElement(script)

  const data = JSON.parse($(script)?.textContent || '{}')
  if (!data.author)
    return

  const follows = data.author.interactionStatistic[0].userInteractionCount

  $$(selector)[1].textContent = numFmt(follows)
}

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

async function editTweet() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  })

  const btnSelector = '.css-175oi2r.r-sdzlij.r-1phboty.r-rs99b7.r-lrvibr.r-1sp3mco.r-mxifo9.r-gu64tb.r-1loqt21.r-o7ynqc.r-6416eg.r-1ny4l3l'
  const btn = await waitForElement(btnSelector, true)

  if (!btn)
    return

  const newBtn = btn.cloneNode(true) as HTMLElement
  newBtn.querySelector('span')!.textContent = '编辑'
  btn.parentNode?.appendChild(newBtn)
  newBtn.onclick = processTweet
}
