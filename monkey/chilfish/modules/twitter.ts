import { $, store } from '~/monkey/utils'
import { UrlActions } from '../types'
import { css } from '../utils'

export default {
  pattern: /(twitter|x)\.com/,
  action() {
    css`
      div, span {
        font-size: 14px !important;
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
