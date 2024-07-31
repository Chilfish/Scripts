import { exec } from 'node:child_process'
import { promisify } from 'node:util'
import { ofetch } from 'ofetch'
import { load as loadXML } from 'cheerio'
import { fmtDuration, now, setInterval_ } from '~/utils'
import { createLogger } from '~/utils/logger'
import { config } from '~/utils/config'
import { dir, readJson, writeJson } from '~/utils/file'

interface Cache {
  title: string
  url: string
  duration: number
  downloadAt?: string
}

const {
  urls: rssUrls,
  interval: rssInterval,
  folder,
  maxDuration,
} = config.rss

const logger = createLogger('rss-download')
const execAsync = promisify(exec)
const cacheFile = dir('data/cache-rss.json')

const cache = {
  data: [] as Cache[],

  async init() {
    this.data = await readJson<Cache[]>(cacheFile)
      .catch(async () => {
        await writeJson(cacheFile, [])
        return []
      })
  },
  get(url: string) {
    return this.data.find(item => item.url === url)
  },
  async set(data: Cache) {
    this.data.push(data)
    await writeJson(cacheFile, this.data)
  },
  async update(url: string, data: Partial<Cache>) {
    const item = this.get(url)
    if (!item) {
      return
    }
    Object.assign(item, data)
    await writeJson(cacheFile, this.data)
  },
}

const isBili = (url: string) => url.includes('bilibili.com/video/BV')
async function getBiliDuraiton(url: string) {
  const bvid = url.match(/BV\w+/)?.[0] || ''

  const { data } = await ofetch(`https://api.bilibili.com/x/web-interface/view?bvid=${bvid}`)

  return data.duration
}

async function fetchRSS(url: string) {
  const text = await ofetch<string>(url)

  const $ = loadXML(text, {
    xml: true,
  })
  const items = $('item')
  const result = items.map((_, item) => {
    const author = $(item).find('author').text()
    const title = $(item).find('title').text()
    const link = $(item).find('link').text()
    return {
      title: `${author}_${title}`,
      link,
    }
  }).get()
  return result
}

async function downloadVideo(url: string, title: string) {
  logger.info(`Downloading ${title} from ${url}`)
  let execOut = {} as { stdout: string, stderr: string }

  if (isBili(url)) {
    execOut = await execAsync(`bbdown -aria2 -mt --aria2c-args="-x16 -s16 -j16" -e "hevc" -q "1080P 高清" -hs --work-dir=${folder} ${url}`)
  }
  else {
    execOut = await execAsync(`python ${dir('python/video-dlp.py')} ${url}`)
  }

  if (execOut.stderr) {
    logger.error(execOut.stderr)
  }
}

async function main(title: string, link: string) {
  const cacheItem = cache.get(link)

  // 如果已经下载过了，或者时长超过限制，就不再下载
  if (cacheItem) {
    if (cacheItem.downloadAt) {
      return
    }
    else if (cacheItem.duration || Number.MAX_SAFE_INTEGER > maxDuration) {
      logger.warn(`Skip ${link} for duration ${fmtDuration(cacheItem.duration)}`)
      return
    }
  }

  const duration = isBili(link) ? await getBiliDuraiton(link) : 0
  await cache.set({
    title,
    url: link,
    duration,
  })

  if (duration > maxDuration) {
    logger.warn(`Skip ${link} for duration ${fmtDuration(duration)}`)
    return
  }

  await downloadVideo(link, title)
  await cache.update(link, {
    downloadAt: now(),
  })
}

async function run() {
  for (const url of rssUrls) {
    const items = await fetchRSS(url)

    logger.info(`Fetched ${items.length} items`)
    for (const item of items) {
      await main(item.title, item.link)
    }
  }
}

await cache.init()
logger.info(`RSS download started, pid: ${process.pid}`)

process.on('SIGINT', async () => {
  logger.warn('RSS download stopped')
  process.exit(0)
})

setInterval_(run, rssInterval * 60 * 1000)
