import { UrlActions } from '../types'
import { css } from '../utils'

export default {
  pattern: /weibo\.com/,
  action: () => {
    css`
      div, p, li, a, span {
        font-size: 12.5px !important;
      }
    `
  },
} satisfies UrlActions
