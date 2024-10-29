import { buildUrl, PQueue, randomUserAgent } from '~/utils'
import {
  dir,
  downloadBlob,
  proxyFetch,
  readCookie,
} from '~/utils/index.node'

const cookie = readCookie('pixiv')
const uid = 70847616
const dest = dir('D:/Downloads/pixiv')
const queue = new PQueue({ concurrency: 4 })
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
    headers: {
      cookie,
      'Referer': `https://www.pixiv.net/users/${uid}`,
      'User-Agent': randomUserAgent(),
    },
  })
    .then(res => res.json() as Promise<T>)
    .catch((err) => {
      console.error(`Error: ${err.message}`)
      return null
    })
}

async function getBookmarks(offset: number) {
  const data = await _fetch(`/user/${uid}/illusts/bookmarks`, {
    offset,
    limit: 48 * (offset || 1),
    rest: 'show',
    tag: '',
  })
  return data.body
}

async function getIllusts(work: Work) {
  const data = await _fetch(`/illust/${work.id}/pages`)

  return data.body.map((item: any, idx: number) => {
    const suffix = idx > 0 ? `-${idx}` : ''

    return {
      url: item.urls.original,
      name: `${work.userId}-${work.id}${suffix}.jpg`,
    }
  }) as Url[]
}

async function main(page: number) {
  const { works, total } = await getBookmarks(page) as { works: Work[], total: number }
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

  for (const { url, name } of urls) {
    queue.add(() => downloadBlob({
      url,
      dest,
      name,
      fetchOptions: {
        headers: {
          cookie,
          Referer: `https://www.pixiv.net/users/${uid}`,
        },
      },
    }))
  }

  await queue.onIdle()

  const hasNext = worksCount < total
  if (hasNext) {
    urls.length = 0
    queue.clear()
    await main(page + 1)
  }
}

await main(0)
