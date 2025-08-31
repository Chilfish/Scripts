import { z } from 'zod'
import { writeJson } from '~/utils/nodejs'
import data from '../../data/bili/azusakun_infty.json'

// --- Zod Schemas ---

/**
 * @description 基础作者信息，用于描述任何一个动态的作者。
 * @note 此Schema适用于动态列表的主作者，也适用于列表中每个独立动态（包括转发动态的原动态）的作者。
 */
const BaseAuthorSchema = z.object({
  id: z.number().describe('用户ID'),
  name: z.string().describe('用户昵称'),
  avatar: z.url().describe('用户头像URL'), // 使用 z.url() 确保是有效的URL
  profileUrl: z.string().describe('用户空间主页URL (可能是协议相对URL，例如 "//space.bilibili.com/...")'),
}).describe('动态的作者基础信息')

/**
 * @description 完整的主作者信息，包含更多细节（如VIP状态、装扮等）。
 * @note 此Schema仅用于描述整个动态列表所属的“主作者”信息，因为它可能包含更多列表层面的个性化信息。
 */
const PrimaryAuthorSchema = BaseAuthorSchema.extend({
  isVip: z.boolean().describe('是否为大会员'),
  vipLabel: z.string().optional().describe('大会员标签文本，例如 "年度大会员"'),
  decorateName: z.string().optional().describe('用户装扮名称'),
  decorateCardUrl: z.url().optional().describe('用户装扮卡片URL'),
}).describe('当前动态列表所属的主作者的详细信息')

/**
 * @description 图片信息。
 */
const ImageSchema = z.object({
  src: z.url().describe('图片URL'),
  width: z.number().optional().describe('图片宽度'),
  height: z.number().optional().describe('图片高度'),
})

/**
 * @description 视频内容详情。
 */
const VideoContentDetailSchema = z.object({
  title: z.string().describe('视频标题'),
  cover: z.url().describe('视频封面URL'),
  description: z.string().optional().describe('视频简介'),
  duration: z.string().describe('视频时长文本，例如 "08:43"'),
  playCount: z.string().describe('播放量文本'),
  danmakuCount: z.string().describe('弹幕数量文本'),
  url: z.url().describe('视频播放页URL (可能是协议相对URL)'),
  bvid: z.string().optional().describe('视频BVID'),
  aid: z.string().optional().describe('视频AID'),
  badgeText: z.string().optional().describe('视频徽章文本，例如 "投稿视频"'),
}).describe('视频动态的详细内容')

/**
 * @description 文章内容详情。
 */
const ArticleContentDetailSchema = z.object({
  title: z.string().describe('文章标题'),
  covers: z.array(z.url()).optional().describe('文章封面图片URL列表'),
  description: z.string().optional().describe('文章简介'),
  viewLabel: z.string().optional().describe('阅读量标签，例如 "1463阅读"'),
  url: z.url().describe('文章阅读页URL (可能是协议相对URL)'),
  id: z.number().optional().describe('文章ID'),
}).describe('文章动态的详细内容')

/**
 * @description 动态的主要内容，可以是图片、视频或文章。
 *              使用 discriminatedUnion 以便根据 `type` 字段区分具体内容。
 */
const PostMajorContentSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('MAJOR_TYPE_DRAW'),
    images: z.array(ImageSchema).describe('图片列表'),
  }).describe('图片动态的主要内容'),
  z.object({
    type: z.literal('MAJOR_TYPE_ARCHIVE'),
    video: VideoContentDetailSchema.describe('视频动态的主要内容'),
  }).describe('视频动态的主要内容'),
  z.object({
    type: z.literal('MAJOR_TYPE_ARTICLE'),
    article: ArticleContentDetailSchema.describe('文章动态的主要内容'),
  }).describe('文章动态的主要内容'),
  z.object({
    type: z.literal('MAJOR_TYPE_NONE'),
  }).describe('无主要内容的动态（例如纯文本动态或转发纯文本动态）'),
]).describe('动态的主要内容，根据类型包含不同数据')

/**
 * @description 帖子内容，支持文本、图片、视频或文章。
 * @note 富文本节点 (richTextNodes) 已移除，仅保留纯文本。
 */
const PostContentSchema = z.object({
  text: z.string().describe('动态文本内容'),
  majorContent: PostMajorContentSchema.optional().describe('动态的主要内容，可以是图片、视频或文章'),
})

/**
 * @description 帖子互动统计数据。
 */
const PostStatsSchema = z.object({
  commentCount: z.number().describe('评论数量'),
  forwardCount: z.number().describe('转发数量'),
  likeCount: z.number().describe('点赞数量'),
  isLiked: z.boolean().describe('当前用户是否已点赞'),
})

/**
 * @description B站帖子（动态）的结构。使用 z.lazy 实现递归类型，以支持转发动态。
 * @note 每个帖子现在都包含其自身的作者信息。
 */
interface BilibiliPostShape {
  id: z.ZodString
  type: z.ZodString // e.g., "DYNAMIC_TYPE_DRAW", "DYNAMIC_TYPE_AV", "DYNAMIC_TYPE_ARTICLE", "DYNAMIC_TYPE_FORWARD"
  isPinned: z.ZodBoolean
  author: typeof BaseAuthorSchema // 每个帖子都有自己的作者信息
  pubTimeText: z.ZodString // 发布时间文本，例如 "2天前", "2023年03月30日"
  pubTimestamp: z.ZodNumber // 发布时间Unix时间戳 (秒)
  content: typeof PostContentSchema
  stats: typeof PostStatsSchema
  originalPost: z.ZodOptional<z.ZodLazy<z.ZodObject<BilibiliPostShape>>> // 递归引用自身
}

const BilibiliPostSchema: z.ZodObject<BilibiliPostShape> = z.object({
  id: z.string().describe('动态ID'),
  type: z.string().describe('动态类型，例如 "DYNAMIC_TYPE_DRAW" (图片动态), "DYNAMIC_TYPE_AV" (视频动态), "DYNAMIC_TYPE_ARTICLE" (文章动态), "DYNAMIC_TYPE_FORWARD" (转发动态)'),
  isPinned: z.boolean().describe('是否为置顶动态'),
  author: BaseAuthorSchema.describe('该动态的作者信息'),
  pubTimeText: z.string().describe('发布时间文本，例如 "2天前", "2023年03月30日"'),
  pubTimestamp: z.number().describe('发布时间Unix时间戳 (秒)'),
  content: PostContentSchema.describe('动态内容'),
  stats: PostStatsSchema.describe('动态统计数据'),
  originalPost: z.lazy(() => BilibiliPostSchema).optional().describe('如果为转发动态，则为原始动态内容'),
})

/**
 * @description 最终输出的B站帖子列表结构。
 * @example { author: { id: 123, name: "...", ... }, posts: [...] }
 */
const BilibiliPostListOutputSchema = z.object({
  author: PrimaryAuthorSchema.describe('当前动态列表所属的主作者信息'),
  posts: z.array(BilibiliPostSchema).describe('整理后的B站动态列表'),
})

// --- 推断出的 TypeScript 类型 ---
type BaseAuthor = z.infer<typeof BaseAuthorSchema>
type PrimaryAuthor = z.infer<typeof PrimaryAuthorSchema>
type BilibiliPost = z.infer<typeof BilibiliPostSchema>
type BilibiliPostListOutput = z.infer<typeof BilibiliPostListOutputSchema>
type PostMajorContent = z.infer<typeof PostMajorContentSchema>
type VideoContentDetail = z.infer<typeof VideoContentDetailSchema>
type ArticleContentDetail = z.infer<typeof ArticleContentDetailSchema>

// --- 原始数据接口 (仅用于函数输入类型提示，不进行 Zod 验证) ---
interface RawBilibiliPost {
  id_str: string
  type: string
  modules: {
    module_author: {
      mid: number
      name: string
      face: string
      jump_url: string
      pub_time: string
      pub_ts: number
      vip?: {
        status: number
        label?: {
          text?: string | null
        }
      } | null
      decorate?: {
        name: string
        card_url: string
      }
      pub_action?: string
    }
    module_dynamic: {
      desc?: {
        text?: string
        rich_text_nodes?: any[]
      }
      major?: {
        type: string // "MAJOR_TYPE_DRAW", "MAJOR_TYPE_ARCHIVE", "MAJOR_TYPE_ARTICLE"
        draw?: {
          id: number
          items: { src: string, width: number, height: number, size: number, tags: any[] }[]
        }
        archive?: {
          aid: string
          badge?: { text: string, bg_color: string, color: string }
          bvid: string
          cover: string
          desc: string
          duration_text: string
          jump_url: string
          stat: { danmaku: string, play: string }
          title: string
          type: number
        }
        article?: {
          covers: string[]
          desc: string
          id: number
          jump_url: string
          label: string
          title: string
        }
      }
      topic?: any
    }
    module_stat: {
      comment?: { count?: number, forbidden?: boolean }
      forward?: { count?: number, forbidden?: boolean }
      like?: { count?: number, forbidden?: boolean, status?: boolean }
    }
    module_tag?: { text: string }
  }
  orig?: RawBilibiliPost
  visible?: boolean
}

// --- 数据处理函数 ---

/**
 * @description 筛选并整理B站帖子列表数据，使其易读且适合UI展示。
 *              将主作者信息提取到最外层对象，并移除帖子中的富文本节点。
 *              支持图片、视频和文章动态类型，并正确保留转发动态的原作者信息。
 * @param rawData 原始B站帖子列表数据
 * @returns 整理后的帖子列表，符合 BilibiliPostListOutput 类型
 */
function processBilibiliPosts(rawData: RawBilibiliPost[]): BilibiliPostListOutput {
  if (!rawData || rawData.length === 0) {
    return {
      author: {
        id: 0,
        name: '未知用户',
        avatar: '',
        profileUrl: '',
        isVip: false,
      },
      posts: [],
    }
  }

  // 假设所有动态都来自同一个作者，从第一个动态中提取主作者信息
  const firstPostAuthor = rawData[0].modules.module_author
  const primaryAuthor: PrimaryAuthor = {
    id: firstPostAuthor.mid,
    name: firstPostAuthor.name,
    avatar: firstPostAuthor.face,
    profileUrl: firstPostAuthor.jump_url,
    isVip: firstPostAuthor.vip?.status === 1,
    vipLabel: firstPostAuthor.vip?.label?.text || undefined,
    decorateName: firstPostAuthor.decorate?.name || undefined,
    decorateCardUrl: firstPostAuthor.decorate?.card_url || undefined,
  }

  /**
   * @description 内部辅助函数，用于处理单个原始帖子数据。
   * @param postData 单个原始帖子数据
   * @returns 整理后的 BilibiliPost 对象
   */
  const processSinglePost = (postData: RawBilibiliPost): BilibiliPost => {
    const dynamic = postData.modules.module_dynamic
    const stats = postData.modules.module_stat
    const authorModule = postData.modules.module_author

    // 提取当前帖子的作者信息
    const postAuthor: BaseAuthor = {
      id: authorModule.mid,
      name: authorModule.name,
      avatar: authorModule.face,
      profileUrl: authorModule.jump_url,
    }

    let majorContent: PostMajorContent | undefined
    let postText = dynamic.desc?.text || '' // 优先使用动态描述文本

    if (dynamic.major) {
      switch (dynamic.major.type) {
        case 'MAJOR_TYPE_DRAW':
          if (dynamic.major.draw?.items) {
            majorContent = {
              type: 'MAJOR_TYPE_DRAW',
              images: dynamic.major.draw.items.map(item => ({
                src: item.src,
                width: item.width,
                height: item.height,
              })),
            }
          }
          break
        case 'MAJOR_TYPE_ARCHIVE':
          if (dynamic.major.archive) {
            const archive = dynamic.major.archive
            majorContent = {
              type: 'MAJOR_TYPE_ARCHIVE',
              video: {
                title: archive.title,
                cover: archive.cover,
                description: archive.desc || undefined,
                duration: archive.duration_text,
                playCount: archive.stat.play,
                danmakuCount: archive.stat.danmaku,
                url: archive.jump_url,
                bvid: archive.bvid,
                aid: archive.aid,
                badgeText: archive.badge?.text || undefined,
              },
            }
            // 如果动态描述为空，尝试从视频简介中获取
            if (!postText && archive.desc) {
              postText = archive.desc
            }
          }
          break
        case 'MAJOR_TYPE_ARTICLE':
          if (dynamic.major.article) {
            const article = dynamic.major.article
            majorContent = {
              type: 'MAJOR_TYPE_ARTICLE',
              article: {
                title: article.title,
                covers: article.covers || undefined,
                description: article.desc || undefined,
                viewLabel: article.label || undefined,
                url: article.jump_url,
                id: article.id,
              },
            }
            // 如果动态描述为空，尝试从文章简介中获取
            if (!postText && article.desc) {
              postText = article.desc
            }
          }
          break
        default:
          majorContent = { type: 'MAJOR_TYPE_NONE' } // 默认无主要内容
          break
      }
    }
    else if (!postText) {
      // 如果没有 major 内容且没有 desc text，则也认为是 MAJOR_TYPE_NONE
      majorContent = { type: 'MAJOR_TYPE_NONE' }
    }

    const processedPost: BilibiliPost = {
      id: postData.id_str,
      type: postData.type,
      isPinned: postData.modules.module_tag?.text === '置顶',
      author: postAuthor, // 将当前帖子的作者信息添加到这里
      pubTimeText: authorModule.pub_time,
      pubTimestamp: authorModule.pub_ts,
      content: {
        text: postText,
        majorContent,
      },
      stats: {
        commentCount: stats?.comment?.count || 0,
        forwardCount: stats?.forward?.count || 0,
        likeCount: stats?.like?.count || 0,
        isLiked: stats?.like?.status || false,
      },
      originalPost: undefined,
    }

    // 如果是转发动态，则递归处理原始动态内容
    if (postData.type === 'DYNAMIC_TYPE_FORWARD' && postData.orig) {
      processedPost.originalPost = processSinglePost(postData.orig) // 递归调用会正确处理原动态的作者
    }

    return processedPost
  }

  // 遍历原始数据数组，对每个帖子应用处理函数
  const posts = rawData.map(processSinglePost)

  // 返回最终的 `{ author: {}, posts: [] }` 结构
  return {
    author: primaryAuthor,
    posts,
  }
}

const result = processBilibiliPosts(data)

await writeJson('data/bili/azusakun_infty_mapped.json', result)
