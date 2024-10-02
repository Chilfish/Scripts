import extensions from './extensions'
// import SearchTimelineModule from './modules/search-timeline'
import TweetDetailModule from './modules/tweet-detail'
import UserTweetsModule from './modules/user-tweets'

extensions.add(UserTweetsModule)
extensions.add(TweetDetailModule)
// extensions.add(SearchTimelineModule)

extensions.start()
