import type { UrlActions } from '../types'
import { $, $$, css } from '~/utils/dom'

export default {
  pattern: /moegirl\.org\.cn/,
  css: () => css`
    .n-notification-container,
    nav#moe-global-toolbar,
    div#moe-article-comments-sidenav-compact,
    ins.adsbygoogle.adsbygoogle-noablate,
    div#aswift_1_host,
    .mwe-popups-container,
    ._01T-L5Cj4R_pdxok9,
    .-WH4kRaZFv_pdxok9,
    .LKiWAjzNmD_pdxok9,
    .X-2JFOXOR1_pdxok9 {
      display: none !important;
      width: 0 !important;
      height: 0 !important;
      opacity: 0 !important;
      visibility: hidden !important;
    }

    body {
      overflow-y: auto !important;
    }
  `,
  action: () => {
    document.addEventListener('click', (e) => {
      const link = (e.target as HTMLElement).closest('a')
      if (!link)
        return

      const href = link.getAttribute('href')
      if (!href)
        return

      if (href.startsWith('#'))
        return

      e.preventDefault()
      window.open(href, '_blank')
    })

    const ads = $$('ins')
    ads.forEach(ad => ad.remove())

    window.addEventListener('hashchange', () => {
      const ad = $('ins')
      if (ad) {
        ad.remove()
      }
    })
  },
} satisfies UrlActions
