import { Extension, ExtensionType } from '../../extensions'
import { ListTimelineInterceptor } from './api'

export default class ListTimelineModule extends Extension {
  name = 'ListTimelineModule'

  type = ExtensionType.TWEET

  intercept() {
    return ListTimelineInterceptor
  }
}
