import extensions from './extensions'
// import SearchTimelineModule from './modules/search-timeline'
import TweetDetailModule from './modules/tweet-detail'

extensions.add(TweetDetailModule)
// extensions.add(SearchTimelineModule)

extensions.start()
