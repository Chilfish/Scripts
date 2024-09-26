import { Extension, ExtensionType } from '../../extensions'
import { SearchTimelineInterceptor } from './api'

export default class SearchTimelineModule extends Extension {
  name = 'SearchTimelineModule'

  type = ExtensionType.TWEET

  intercept() {
    return SearchTimelineInterceptor
  }
}
