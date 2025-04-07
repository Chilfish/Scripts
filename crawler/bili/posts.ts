import { ofetch } from 'ofetch'
import { ProxyAgent } from 'undici'
import { delay } from '~/utils'
import { proxyUrl, randomUserAgent } from '~/utils/constant'
import { getBiliAnonToken } from '~/utils/fetch'
import { argvParser, readCookie, writeJson } from '~/utils/nodejs'

interface ResponseData {
  code: number
  message: string
  ttl: number
  data: {
    offset: string
    has_more: boolean
    items: object[]
  }
}

const COUNT_PER_PAGE = 12

const { uid, max, offset: argOffset, anon } = argvParser([{
  key: 'uid',
  shortKey: 'u',
  description: 'User ID',
  type: 'number',
  required: true,
}, {
  key: 'max',
  description: 'Max number of posts to fetch',
  type: 'number',
  default: 10 * COUNT_PER_PAGE,
  beforeSet(value) {
    if (value === -1) {
      return Number.MAX_SAFE_INTEGER
    }
    return value
  },
}, {
  key: 'offset',
  shortKey: 'o',
  description: 'Offset for pagination',
  type: 'string',
  default: '',
}, {
  key: 'anon',
  shortKey: 'a',
  description: 'use anonymous cookie',
  type: 'boolean',
  default: false,
}] as const)

const cookies = (!anon && readCookie('bilibili')) || await getBiliAnonToken()
console.log('use cookie:', cookies)

const fetcher = ofetch.create({
  baseURL: 'https://api.bilibili.com/x/',
  headers: {
    'Cookie': cookies,
    'User-Agent': randomUserAgent(),
    'referer': `https://space.bilibili.com/${uid}`,
  },
  retry: 3,
  dispatcher: new ProxyAgent({
    uri: proxyUrl,
  }),
  onResponse: async ({ response }) => {
    const { body } = response
    if (!body) {
      console.error('Response body is empty')
    }
  },
})

const username = await getUserInfo()

const dir = `data/bili/${username}-${Date.now()}`
let offset = argOffset
let count = 0

console.log({
  uid,
  username,
  max: max === Number.MAX_SAFE_INTEGER ? 'unlimited' : max,
  dir,
  count,
})

async function getUserInfo() {
  const res = await fetcher('/web-interface/card', {
    params: {
      mid: uid,
    },
  })

  return res.data?.card.name || uid
}

async function getUserPosts() {
  // https://api.bilibili.com/x/polymer/web-dynamic/v1/feed/space?host_mid=
  const res = await fetcher<ResponseData>('/polymer/web-dynamic/v1/feed/space', {
    params: {
      host_mid: uid,
      offset,
    },
  })
  const noData = {
    posts: [],
    hasMore: false,
  }

  if (res.code !== 0) {
    console.error('Failed to get user posts:', res.message)
    return noData
  }
  if (!res.data) {
    console.error('Response data is empty')
    return noData
  }

  if (res.data.offset) {
    offset = res.data.offset
  }
  const posts = res.data.items

  if (posts.length === 0) {
    console.log('No more posts')
    return noData
  }

  const idx = Math.floor(count / COUNT_PER_PAGE) + 1
  await writeJson(`${dir}/${idx}-${offset}.json`, posts)
  return {
    posts,
    hasMore: res.data.has_more,
  }
}

async function getAllUserPosts() {
  let hasMore = true
  while (hasMore) {
    const data = await getUserPosts()
    hasMore = data.hasMore
    const posts = data.posts
    count += posts.length

    if (count >= max) {
      console.log('Reached max posts limit:', max)
      break
    }

    console.log({
      fetched: posts.length,
      offset,
      hasMore,
      count,
    })
    await delay(500)
  }
}

await getAllUserPosts()

console.log('Fetched', count, 'posts')
