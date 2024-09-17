import extensions from './extensions'
import HomeTimelineModule from './modules/home-timeline'

import LikesModule from './modules/likes'
import ListTimelineModule from './modules/list-timeline'
import UserTweetsModule from './modules/user-tweets'
import logger from './utils/logger'

extensions.add(HomeTimelineModule)
extensions.add(ListTimelineModule)
extensions.add(UserTweetsModule)
extensions.add(LikesModule)

extensions.start()

logger.info('Hello Twitter!')
