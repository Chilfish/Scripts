import { Extension, ExtensionType } from '../../extensions'
import { LikesInterceptor } from './api'

export default class LikesModule extends Extension {
  name = 'LikesModule'

  type = ExtensionType.TWEET

  intercept() {
    return LikesInterceptor
  }
}
