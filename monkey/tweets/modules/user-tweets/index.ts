import { Extension, ExtensionType } from '../../extensions'
import { UserTweetsInterceptor } from './api'

export default class UserTweetsModule extends Extension {
  name = 'UserTweetsModule'

  type = ExtensionType.TWEET

  intercept() {
    return UserTweetsInterceptor
  }
}
