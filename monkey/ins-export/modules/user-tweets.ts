import { destr } from 'destr'
import { Interceptor, Tweet, User, UserFeed } from '../types'
import { saveAs } from '~/monkey/utils'
import { formatDate } from '~/utils/date'

const urlMatch = 'graphql/query'
const tweetKey = 'xdt_api__v1__feed__user_timeline_graphql_connection'
let user: User | undefined
const tweets: Tweet[] = []

export const getTweets: Interceptor = (request, response) => {
  if (!request.url.includes(urlMatch))
    return

  const { data } = destr<{ data: any }>(response.responseText)

  if (!data[tweetKey])
    return

  const { edges, page_info } = data[tweetKey] as UserFeed

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
      created_at: formatDate(caption.created_at),
      images,
    }
  })
    .filter(Boolean) as Tweet[],
  )

  if (!page_info?.has_next_page && tweets.length > 0) {
    const now = new Date().getTime()
    saveAs(
      { user, tweets },
      `${user?.username}-${now}.json`,
    )
  }
}
