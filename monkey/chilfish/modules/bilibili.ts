import { $$, css, waitForElement } from '~/utils/dom'
import { numFmt } from '~/utils/math'
import { UrlActions } from '../types'

export default {
  pattern: /space\.bilibili\.com/,
  css: () => css`
  `,
  action: async () => {
    const stats = await waitForElement('.nav-statistics')
    if (!stats)
      return

    const statItems = $$('.nav-statistics__item-num', stats)

    statItems.forEach((item) => {
      const title = item.title!

      const num = Number(title.replaceAll(',', ''))
      if (!Number.isNaN(num)) {
        item.textContent = numFmt(num)
      }
    })
  },
} satisfies UrlActions
