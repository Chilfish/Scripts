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
      a[aria-label="Grok"],
      a[aria-label="Lists"],
      div[aria-label="Analytics"],
      button[aria-label="Grok 操作"] {
        display: none !important;
      }
  `
  },
} satisfies UrlActions
