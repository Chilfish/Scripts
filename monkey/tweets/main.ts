import extensions from './extensions'
import logger from './utils/logger'

import HomeTimelineModule from './modules/home-timeline'
import ListTimelineModule from './modules/list-timeline'
import UserTweetsModule from './modules/user-tweets'
import LikesModule from './modules/likes'

extensions.add(HomeTimelineModule)
extensions.add(ListTimelineModule)
extensions.add(UserTweetsModule)
extensions.add(LikesModule)

extensions.start()

logger.info('Hello Twitter!')
