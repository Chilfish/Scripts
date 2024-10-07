import { $$ } from '~/monkey/utils'
import { numFmt } from '~/utils/math'

export function fixFollowers(followers: number) {
  if (!followers || followers < 10000)
    return

  const selector = 'a span.css-1jxf684.r-bcqeeo.r-1ttztb7.r-qvutc0.r-poiln3.r-n6v787.r-1f529hi.r-b88u0q'
  const el = $$(selector)

  const followersEl = el.at(1)
  if (followersEl) {
    followersEl.textContent = numFmt(followers)
  }
}
