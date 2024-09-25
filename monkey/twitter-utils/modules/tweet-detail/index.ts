import { Extension, ExtensionType } from '../../extensions'
import { TweetDetailInterceptor } from './api'

export default class TweetDetailModule extends Extension {
  name = 'TweetDetailModule'

  type = ExtensionType.TWEET

  intercept() {
    return TweetDetailInterceptor
  }
}
