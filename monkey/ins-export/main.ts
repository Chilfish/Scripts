import { httpHooks } from './utils/fetch'
import { getTweets } from './modules/user-tweets'

httpHooks([
  getTweets,
])
