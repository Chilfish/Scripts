import { $, store } from '~/monkey/utils'

function removeRetweets(el: HTMLElement) {
  const svgWapper = '.css-175oi2r.r-18kxxzh.r-ogg1b9.r-1mrc8m9.r-obd0qt.r-1777fci'
  const whiteList = store.get<string[]>('whiteList', [])

  const svg = $(svgWapper, el)
  if (!svg)
    return

  const username = svg.nextElementSibling?.textContent?.split(' ')[0] || ''
  if (whiteList?.includes(username))
    return

  svg.closest('article')?.remove()
}

export default {
  tagName: 'DIV',
  action: removeRetweets,
}
