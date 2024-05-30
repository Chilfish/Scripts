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
      owner: User
      carousel_media: {
        image_versions2: Image2
      }[] | undefined
      image_versions2: Image2
    }
  }[]
  page_info: {
    end_cursor: string
    has_next_page: boolean
  }
}
