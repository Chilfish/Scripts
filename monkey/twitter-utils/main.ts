import extensions from './extensions'
import { observeDoms } from './modules/doms'
// import SearchTimelineModule from './modules/search-timeline'
import TweetDetailModule from './modules/tweet-detail'
import UserTweetsModule from './modules/user-tweets'
import './style'

extensions.add(UserTweetsModule)
extensions.add(TweetDetailModule)
// extensions.add(SearchTimelineModule)

extensions.start()
observeDoms()
