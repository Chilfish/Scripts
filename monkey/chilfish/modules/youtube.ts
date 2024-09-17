import { UrlActions } from '../types'
import { css } from '../utils'

export default {
  pattern: /youtube\.com/,
  action: () => {
    css`
      .ytp-gradient-bottom {
        display: none !important;
      }
    `
  },
} satisfies UrlActions
