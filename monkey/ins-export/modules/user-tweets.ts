import type { Interceptor, Tweet, User, UserFeed } from '../types'
import { parseJson, saveAs } from '../utils'

const urlMatch = 'graphql/query'
let user: User | undefined
const tweets: Tweet[] = []
let started = false

export const getTweets: Interceptor = (request, response) => {
  if (!request.url.includes(urlMatch))
    return

  const tweetKey = 'xdt_api__v1__feed__user_timeline_graphql_connection'
  const { data } = parseJson(response.responseText)

  if (!data[tweetKey])
    return

  const { edges, page_info } = data[tweetKey] as UserFeed

  if (edges.length > 6) {
    started = true
    console.log('started')
  }
  if (!started)
    return

  console.log('fetched:', tweets.length)

  tweets.push(...edges.map(({ node }) => {
    const { code, caption, owner, carousel_media, image_versions2 } = node
    if (!caption)
      return null

    let images = carousel_media?.map(({ image_versions2 }) => image_versions2.candidates[0].url)
    if (!images)
      images = [image_versions2.candidates[0].url]

    user = {
      username: owner.username,
      full_name: owner.full_name,
      profile_pic_url: owner.profile_pic_url,
    }

    return {
      id: code,
      text: caption.text,
      created_at: caption.created_at,
      images,
    }
  })
    .filter(Boolean) as Tweet[],
  )

  if (!page_info.has_next_page) {
    const now = new Date().getTime()
    saveAs(
      { user, tweets },
      `${user?.username}-${now}.json`,
    )
  }
}
