import { buildUrl, PQueue, randomUserAgent } from '~/utils'
import {
  argvParser,
  dir,
  downloadFiles,
  proxyFetch,
  readCookie,
} from '~/utils/nodejs'

const args = argvParser([{
  key: 'uid',
  description: '用户ID',
  type: 'number',
  required: true,
}, {
  key: 'dest',
  description: '下载目录',
  default: 'F:/Downloads/pixiv',
}] as const)

const cookie = readCookie('pixiv')
const uid = args.uid
const dest = dir(args.dest)
const queue = new PQueue({ concurrency: 4 })
const fetchHeaders = {
  cookie,
  'Referer': `https://www.pixiv.net/users/${uid}`,
  'User-Agent': randomUserAgent(),
}

let worksCount = 0

interface Work {
  id: number
  title: string
  userName: string
  userId: string
  pageCount: number
}

interface Url {
  url: string
  name: string
}

async function _fetch<T = any>(path: string, query: object = {}) {
  const url = buildUrl({
    uri: `https://www.pixiv.net/ajax${path}`,
    query: {
      ...query,
      lang: 'zh',
    },
  })

  return await proxyFetch(url, {
    headers: fetchHeaders,
  })
    .then(res => res.json() as Promise<T>)
    .catch((err) => {
      console.error(`Error: ${err.message}`)
      return null
    })
}

async function getBookmarks(offset: number): Promise<{ works: Work[], total: number }> {
  const data = await _fetch(`/user/${uid}/illusts/bookmarks`, {
    offset,
    limit: 48 * (offset || 1),
    rest: 'show',
    tag: '',
  })
  const res = data.body
  if (data.error) {
    throw new Error(`[bookmarks] ${data.message}`)
  }
  return res
}

async function getIllusts(work: Work) {
  const data = await _fetch(`/illust/${work.id}/pages`)

  return data.body.map((item: any, idx: number) => {
    const suffix = idx > 0 ? `-${idx}` : ''

    return {
      url: item.urls.original,
      name: `${work.userName}-${work.id}${suffix}.jpg`,
    }
  }) as Url[]
}

async function main(page: number) {
  const { works, total } = await getBookmarks(page)
  if (!works.length) {
    console.log('No works found')
    return
  }

  const urls = [] as Url[]
  worksCount += works.length

  for (const work of works) {
    queue.add(async () => {
      const _urls = await getIllusts(work)
      urls.push(..._urls)
    })
  }

  await queue.onIdle()

  console.log(`Downloading: ${urls.length}, total: ${worksCount}/${total}`)

  await downloadFiles(urls, {
    dest,
    concurrency: 4,
    fetchOptions: {
      headers: fetchHeaders,
    },
  })

  const hasNext = worksCount < total
  if (hasNext) {
    urls.length = 0
    queue.clear()
    await main(page + 1)
  }
}

await main(0)
