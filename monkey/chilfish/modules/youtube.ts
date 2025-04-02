import { css } from '~/utils/dom'
import { UrlActions } from '../types'

export default {
  pattern: /youtube\.com/,
  css: () => css`
    .ytp-gradient-bottom {
      display: none !important;
    }
  `,
  action: () => {
  },
} satisfies UrlActions
