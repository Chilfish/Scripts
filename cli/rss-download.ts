import { exec } from 'node:child_process'
import { createServer } from 'node:http'
import { promisify } from 'node:util'
import { load as loadXML } from 'cheerio'
import { CronJob } from 'cron'
import { ofetch } from 'ofetch'
import { fmtDuration, now } from '~/utils'
import {
  config,
  createLogger,
  dir,
  proxyFetch,
  readJson,
  writeJson,
} from '~/utils/nodejs'

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
  const text = await proxyFetch(url)
    .then(res => res.text())
    .catch((e) => {
      logger.error(`Fetch ${url} failed: ${e.message}`)
      return ''
    })

  if (!text) {
    return []
  }

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
    execOut = await execAsync([
      'bbdown',
      '-aria2',
      '-mt',
      '-hs',
      '-e hevc',
      '-p 1',
      `-F="<ownerName> - <videoTitle>"`,
      `-M="<ownerName> - <videoTitle>"`,
      `--work-dir=${folder}`,
      url,
    ].join(' '))
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
    const duration = cacheItem.duration || Number.MAX_SAFE_INTEGER
    if (cacheItem.downloadAt || (duration > maxDuration)) {
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

// just for test
const port = 3456
const server = createServer()
server.listen(port, '127.0.0.1')
server.on('request', (req, res) => {
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify({ cache: cache.data }))
})

logger.info(`RSS download started, pid: ${process.pid}`)
process.on('SIGINT', async () => {
  logger.warn('RSS download stopped')
  server.close()
  process.exit(0)
})

const job = CronJob.from({
  cronTime: `0 */${rssInterval} * * * *`,
  onTick: () => {
    run().catch(logger.error)
  },
  runOnInit: true,
  start: true,
  timeZone: 'Asia/Shanghai',
})

job.start()
