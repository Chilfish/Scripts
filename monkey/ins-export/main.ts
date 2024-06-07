import { httpHooks } from './httpHook'
import { getTweets } from './modules/user-tweets'
import {
  GM_getValue,
  GM_registerMenuCommand,
  GM_setValue,
} from '$'

import './media-dl'

const enableAllTweets = GM_getValue('enableAllTweets', false)

if (enableAllTweets)
  httpHooks([getTweets])

GM_registerMenuCommand(
  `导出所有推文 ${enableAllTweets ? '（已启用）' : ''}`,
  () => {
    GM_setValue('enableAllTweets', !enableAllTweets)
    location.reload()
  },
)
