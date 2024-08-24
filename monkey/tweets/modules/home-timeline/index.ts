import { Extension, ExtensionType } from '../../extensions'
import { HomeTimelineInterceptor } from './api'

export default class HomeTimelineModule extends Extension {
  name = 'HomeTimelineModule'

  type = ExtensionType.TWEET

  intercept() {
    return HomeTimelineInterceptor
  }
}
