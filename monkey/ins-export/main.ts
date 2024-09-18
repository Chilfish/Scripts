import {
  GM_getValue,
  GM_registerMenuCommand,
  GM_setValue,
} from '$'
import { httpHooks } from './httpHook'
import { Interceptor } from './types'

import './media-dl'

const enableAllTweets = GM_getValue('enableAllTweets', false)

const modules = import.meta.glob('./modules/*.ts', {
  eager: true,
}) as Record<string, () => Interceptor>

if (enableAllTweets) {
  httpHooks(Object.values(modules).map(m => m()))
}

console.debug('ins-export loaded', { enableAllTweets })

GM_registerMenuCommand(
  `导出所有推文 ${enableAllTweets ? '（已启用）' : ''}`,
  () => {
    GM_setValue('enableAllTweets', !enableAllTweets)
    location.reload()
  },
)
