import { UrlActions } from '../types'
import { css } from '../utils'

export default {
  pattern: /zhihu\.com/,
  action: () => {
    css`
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
    `
  },
} satisfies UrlActions
