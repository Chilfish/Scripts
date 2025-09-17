import { destr } from 'destr'
import { formatDate } from '~/utils/date'
import { saveAs } from '~/utils/dom'
import { InsData, Interceptor, TweetData, User, UserFeed } from '../types'
import { ins2Tweet } from '../utils'

const urlMatch = 'graphql/query'
const tweetKey = 'xdt_api__v1__feed__user_timeline_graphql_connection'
// video: xdt_api__v1__clips__user__connection_v2
let user: User | undefined
const insDataList: InsData[] = []

export const getTweets: Interceptor = (request, response) => {
  if (!request.url.includes(urlMatch))
    return

  const { data } = destr<{ data: any }>(response.responseText)

  if (!data[tweetKey])
    return

  const { edges, page_info } = data[tweetKey] as UserFeed

  console.log('fetched:', insDataList.length)

  edges.forEach(({ node }) => {
    const { code, caption, owner, carousel_media, image_versions2, like_count, comment_count } = node
    if (!caption)
      return

    // 检查是否已经存在相同的数据
    if (insDataList.some(item => item.id === code)) {
      return
    }

    let media = carousel_media?.map(({ image_versions2 }) => ({
      type: 'image' as const,
      url: image_versions2.candidates[0].url,
      width: image_versions2.candidates[0].width,
      height: image_versions2.candidates[0].height,
    }))

    if (!media) {
      media = [{
        type: 'image' as const,
        url: image_versions2.candidates[0].url,
        width: image_versions2.candidates[0].width,
        height: image_versions2.candidates[0].height,
      }]
    }

    user = {
      username: owner.username,
      full_name: owner.full_name,
      profile_pic_url: owner.profile_pic_url,
    }

    const insData: InsData = {
      id: code,
      shortcode: code,
      url: `https://www.instagram.com/p/${code}/`,
      author: {
        id: owner.id || owner.username,
        username: owner.username,
        fullName: owner.full_name,
        avatarUrl: owner.profile_pic_url,
      },
      caption: caption.text,
      createdAt: formatDate(caption.created_at),
      likeCount: like_count || 0,
      commentCount: comment_count || 0,
      media,
    }

    insDataList.push(insData)
  })
}

// 导出函数供UI调用
export function getCollectedDataCount(): number {
  return insDataList.length
}

export function exportCollectedData(): void {
  if (insDataList.length === 0) {
    alert('暂无数据可导出')
    return
  }

  const curUid = user?.username || 'unknown'

  // 转换为 TweetData 格式
  const tweetDataList: TweetData[] = insDataList.map(ins2Tweet).filter(tweet => tweet.userId === curUid)

  const now = new Date().getTime()
  saveAs(
    tweetDataList,
    `${user?.username}-tweets-${now}.json`,
  )

  const mediaLinks = tweetDataList.flatMap(tweet => tweet.media.map(media => media.url))
  saveAs(
    mediaLinks.join('\n'),
    `${user?.username}-media-links-${now}.txt`,
  )

  console.log(`导出了 ${tweetDataList.length} 条数据`)
}
