export interface Interceptor {
  (request: { method: string, url: string }, response: XMLHttpRequest): void
}

export interface Tweet {
  text: string
  id: string
  created_at: string
  images: string[]
}

export interface User {
  username: string
  full_name: string
  profile_pic_url: string
}

export interface InsData {
  id: string
  shortcode: string
  url: string
  author: {
    id: string
    username: string
    fullName: string
    avatarUrl: string
  }
  caption: string
  createdAt: string
  likeCount: number
  commentCount: number
  media: {
    type: 'image' | 'video'
    url: string
    width: number
    height: number
  }[]
}

export interface TweetData {
  id: string
  tweetId: string
  userId: string
  createdAt: string
  fullText: string
  media: {
    url: string
    type: string
    height: number
    width: number
  }[]
  retweetCount: number
  quoteCount: number
  replyCount: number
  favoriteCount: number
  viewsCount: number
  retweetedStatus: null
  quotedStatus: null
}

interface Image2 {
  candidates: {
    url: string
    width: number
    height: number
  }[]
}

export interface UserFeed {
  edges: {
    node: {
      code: string
      caption: {
        text: string
        created_at: string
      }
      owner: User & { id?: string }
      carousel_media: {
        image_versions2: Image2
      }[] | undefined
      image_versions2: Image2
      like_count?: number
      comment_count?: number
    }
  }[]
  page_info: {
    end_cursor: string
    has_next_page: boolean
  }
}
