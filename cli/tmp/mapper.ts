import { z } from 'zod'

/**
 * @description 定义单个媒体（图片或视频）的结构
 * @property {string} id - 媒体的唯一ID
 * @property {'image' | 'video'} type - 媒体类型
 * @property {string} url - 媒体内容的URL，选择最高分辨率的候选URL
 * @property {number} width - 媒体宽度
 * @property {number} height - 媒体高度
 */
const MediaItemSchema = z.object({
  id: z.string(),
  type: z.enum(['image', 'video']),
  url: z.string().url(),
  width: z.number(),
  height: z.number(),
})
export type MediaItem = z.infer<typeof MediaItemSchema>

/**
 * @description 定义帖子作者的结构
 * @property {string} id - 作者的唯一ID (pk)
 * @property {string} username - 作者的用户名 (e.g., "240y_k")
 * @property {string} fullName - 作者的显示全名 (e.g., "西尾夕香")
 * @property {string} avatarUrl - 作者的头像URL
 */
const AuthorSchema = z.object({
  id: z.string(),
  username: z.string(),
  fullName: z.string(),
  avatarUrl: z.string().url(),
})
export type Author = z.infer<typeof AuthorSchema>

/**
 * @description 定义单个帖子的完整结构，这是UI组件直接使用的数据模型
 * @property {string} id - 帖子的唯一ID (pk)
 * @property {string} shortcode - 帖子的短代码，用于生成URL
 * @property {string} url - 帖子的永久链接
 * @property {Author} author - 帖子的作者信息
 * @property {string} caption - 帖子的正文内容
 * @property {Date} createdAt - 帖子的发布日期和时间
 * @property {number} likeCount - 点赞数
 * @property {number} commentCount - 评论数
 * @property {MediaItem[]} media - 帖子包含的媒体项目数组（即使是单图帖子，也放在数组中以保持统一）
 */
const PostSchema = z.object({
  id: z.string(),
  shortcode: z.string(),
  url: z.url(),
  author: AuthorSchema,
  caption: z.string(),
  createdAt: z.date(),
  likeCount: z.number(),
  commentCount: z.number(),
  media: z.array(MediaItemSchema),
})
export type Post = z.infer<typeof PostSchema>

/**
 * @description 定义整个API返回结果的结构
 * @property {Post[]} posts - 帖子对象数组
 * @property {object} pageInfo - 分页信息
 * @property {boolean} pageInfo.hasNextPage - 是否有下一页
 * @property {string | null} pageInfo.endCursor - 用于加载下一页的光标
 */
const FeedResultSchema = z.object({
  posts: z.array(PostSchema),
  pageInfo: z.object({
    hasNextPage: z.boolean(),
    endCursor: z.string().nullable(),
  }),
})
export type FeedResult = z.infer<typeof FeedResultSchema>

/**
 * @description 从媒体节点（单个图片/视频或轮播项）中提取标准化的媒体信息
 * @param mediaNode - Instagram API中的媒体节点对象
 * @returns {MediaItem | null} - 标准化的媒体对象，如果无法解析则返回null
 */
function extractMediaItem(mediaNode: any): MediaItem | null {
  if (!mediaNode || !mediaNode.pk) return null

  const mediaType =
    mediaNode.media_type === 1 ? 'image' : mediaNode.media_type === 2 ? 'video' : null
  if (!mediaType) return null

  let source: { url: string; width: number; height: number } | null = null
  if (mediaType === 'image' && mediaNode.image_versions2?.candidates?.[0]) {
    source = mediaNode.image_versions2.candidates[0]
  } else if (mediaType === 'video' && mediaNode.video_versions?.[0]) {
    // 假设视频结构与图片类似
    source = mediaNode.video_versions[0]
  }

  if (!source || !source.url) return null

  return {
    id: mediaNode.pk,
    type: mediaType,
    url: source.url,
    width: source.width,
    height: source.height,
  }
}

// Main Transformation Function (主要转换函数)
// ----------------------------------------------------------------

/**
 * @description 处理从Instagram API返回的原始JSON数据，并将其转换为易于使用的、结构化的帖子列表。
 * @param apiResponse - 从文件中读取的原始API JSON对象。
 * @returns {FeedResult} - 一个包含帖子列表和分页信息的对象。
 * @throws {Error} - 如果输入数据结构不符合预期或Zod验证失败，将抛出错误。
 */
export function processInstagramFeed(apiResponse: any): FeedResult {
  // 1. 安全地访问帖子数据数组
  const edges = apiResponse?.data?.xdt_api__v1__feed__user_timeline_graphql_connection?.edges

  if (!Array.isArray(edges)) {
    console.error("无法在API响应中找到 'edges' 数组。")
    // 返回一个空的有效结构
    return { posts: [], pageInfo: { hasNextPage: false, endCursor: null } }
  }

  // 2. 遍历每个帖子节点并进行转换
  const posts: Post[] = edges
    .map((edge: any) => {
      const node = edge.node

      // 提取作者信息
      const author: Author = {
        id: node.user.pk,
        username: node.user.username,
        fullName: node.user.full_name,
        avatarUrl: node.user.profile_pic_url,
      }

      // 提取媒体信息 (处理单图/视频和轮播)
      const media: MediaItem[] = []
      if (node.media_type === 8 && node.carousel_media) {
        // 这是一个轮播帖子 (Carousel)
        for (const carouselItem of node.carousel_media) {
          const item = extractMediaItem(carouselItem)
          if (item) media.push(item)
        }
      } else {
        // 这是一个单媒体帖子
        const item = extractMediaItem(node)
        if (item) media.push(item)
      }

      // 组装成最终的帖子对象
      return {
        id: node.pk,
        shortcode: node.code,
        url: `https://www.instagram.com/p/${node.code}/`,
        author,
        caption: node.caption?.text || '', // 如果没有标题则为空字符串
        createdAt: new Date(node.taken_at * 1000), // Unix时间戳转换为Date对象
        likeCount: node.like_count,
        commentCount: node.comment_count,
        media,
      }
    })
    .filter((post): post is Post => post.media.length > 0) // 过滤掉没有成功解析出媒体的帖子

  // 3. 提取分页信息
  const pageInfoNode =
    apiResponse?.data?.xdt_api__v1__feed__user_timeline_graphql_connection?.page_info
  const pageInfo = {
    hasNextPage: pageInfoNode?.has_next_page || false,
    endCursor: pageInfoNode?.end_cursor || null,
  }

  // 4. 使用Zod进行最终验证并返回
  const result = { posts, pageInfo }
  return FeedResultSchema.parse(result)
}

import { writeFile } from 'node:fs/promises'
import { writeJson, readJson } from '~/utils/nodejs'
import { glob } from 'fast-glob'

// const data = await readJson("H:/data/[25] response_www.instagram.com_query.json")

const files = await glob('H:/data/*.json')
const data = [] as Post[]

for (const file of files) {
  const content = await readJson(file)
  const mapped = processInstagramFeed(content)
  data.push(...mapped.posts)
}

await writeJson('H:/data/instagram/240y_k.json', data)

const mediaUrls = data
.flatMap(i => i.media)
.map(i => i.url)

await writeFile('H:/data/instagram/240y_k-media.txt', mediaUrls.join('\n'), 'utf-8')
