import { css } from '~/utils/dom'
import { UrlActions } from '../types'

export default {
  pattern: /weibo\.com/,
  css: () => css`
    div, p, li, a, span {
      font-size: 12.5px !important;
    }
  `,
  action: () => {
  },
} satisfies UrlActions
