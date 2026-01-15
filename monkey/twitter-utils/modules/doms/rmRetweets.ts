import { $ } from '~/utils/dom'
import { store } from '~/utils/monkey'

// TODO: set as path like 'config.rmtweets.enable'
const isEnable = store.get<boolean>('enableRmTweets', false)
const whiteList = store.get<string[]>('whiteList', [])!

function removeRetweets(el: HTMLElement) {
  if (!isEnable)
    return

  const svgWapper = '.css-175oi2r.r-18kxxzh.r-ogg1b9.r-1mrc8m9.r-obd0qt.r-1777fci'

  const svg = $(svgWapper, el)
  if (!svg)
    return

  const article = svg.closest('article')
  if (!article)
    return

  const reTweetUser = $('span[data-testid="socialContext"]', article)?.parentElement as HTMLAnchorElement | null

  const username = reTweetUser?.href.split('/').pop() || ''
  if (whiteList.includes(username))
    return

  article.remove()
}

export default {
  tagName: 'DIV',
  action: removeRetweets,
}
