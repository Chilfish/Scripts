import { css } from '~/utils/dom'
import { UrlActions } from '../types'

export default {
  pattern: /zhihu\.com/,
  css: () => css`
    .VideoAnswerPlayer, .ZVideoItem, .ZVideoItem-video {
        display: none;
      }
      .RichContent-EntityWord.css-b8rgjk {
        color: inherit;
        cursor: default;
      }
      .RichContent-EntityWord.css-b8rgjk .css-1dvsrp {
        display: none;
      }
    `,
  action: () => {
  },
} satisfies UrlActions
