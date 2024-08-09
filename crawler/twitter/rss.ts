import { defineCommand, runMain } from 'citty'
import { serve } from '@hono/node-server'
import { Hono } from 'hono/tiny'
import { Browser } from 'puppeteer'
import { load as loadHTML } from 'cheerio'
import { consola } from 'consola'
import { buildUrl, checkNetwork, devices, getCookie } from '~/utils'
import { json2rss } from '~/utils/rss'
import { createLogger } from '~/utils/logger'
import { readCookie } from '~/utils/config'
import { newBrowser } from '~/utils/puppeteer'

const logger = createLogger('twitter-rss')
const cookies = getCookie(readCookie('twitter'))

let browser: Browser | null

interface Tweet {
  author: string
  text: string
  time: string
  url: string
  image: string
}

async function search(url: string) {
  browser = await newBrowser()
  const page = await browser.newPage()

  page.on('console', msg => logger.info(msg.text()))

  const device = devices.desktop
  await page.setViewport({
    width: device.width,
    height: device.height,
    deviceScaleFactor: 2,
  })

  for (const [name, value] of Object.entries(cookies)) {
    await page.setCookie({ name, value, domain: '.x.com' })
  }

  await page.goto(url, {
    waitUntil: 'domcontentloaded',
  })

  const cssSelector = `article[data-testid="tweet"]`
  await page.waitForSelector(cssSelector, {
    timeout: 15_000,
  })
    .catch(async () => {
      const text = await page.evaluate(() => document.querySelector('#react-root')?.textContent)
      logger.error(`timeout: ${text}`)
    })

  await page.evaluate(() => {
    window.scrollBy(0, window.innerHeight * 2)
  })

  const articles = await page.$$(cssSelector)
  const tweets = await Promise.all(articles.map(async (article) => {
    const html = await article.evaluate(node => node.outerHTML)
    return parseTweet(html)
  }))

  return tweets.filter(Boolean) as Tweet[]
}

function parseTweet(article: string): Tweet | null {
  const $ = loadHTML(article)

  const isAd = $('svg.r-4qtqp9.r-yyyyoo.r-dnmrzs.r-bnwqim.r-lrvibr.r-m6rgpd.r-1q142lx.r-ip8ujx.r-1gs4q39.r-14j79pv').length > 0
  if (isAd) {
    return null
  }

  const tweetText = $(`div[data-testid="tweetText"]`)
  const tweetTime = $(`time`)
  const author = $(`div[data-testid="User-Name"] a`).first()
  const url = tweetTime.parent().attr('href')

  const photos = $(`div[data-testid="tweetPhoto"] img`)
    .map((_i, photo) => photo.attribs.src)
    .filter(Boolean)
    .get()

  const cardPhoto = $(article, `div[data-testid="card.wrapper"] img`).attr('src')

  return {
    author: author.text().trim() || 'Unknown',
    text: tweetText.text().trim() || 'No text',
    time: tweetTime.attr('datetime') || new Date().toISOString(),
    url: url ? `https://x.com${url}` : 'https://x.com',
    image: cardPhoto || photos[0] || '',
  }
}

async function searchRss(keyword: string) {
  try {
    const url = buildUrl({
      uri: `https://x.com/search`,
      query: {
        q: keyword,
        src: 'recent_search_click',
        f: 'live',
      },
    })
    logger.info(`Searching for ${keyword} at ${url}`)
    return await search(url)
  }
  catch (err: any) {
    let mes = await checkNetwork()
    if (mes === 'ok')
      mes = err.message

    logger.error(mes)
    return [] as Tweet[]
  }
  finally {
    await browser?.close()
  }
}

runMain(defineCommand({
  meta: {
    name: 'twitter-rss',
    description: 'RSS for Twitter Search',
  },
  args: {
    keyword: {
      type: 'string',
      description: 'Search keyword',
    },
  },
  run: async ({ args }) => {
    const { keyword } = args
    if (keyword) {
      logger.info(`Searching for ${keyword}`)
      const tweets = await searchRss(keyword)

      consola.info(`Found ${tweets.length} tweets`)
      consola.info(tweets)
      return
    }

    await main()
  },
}))

async function main() {
  const app = new Hono()

  app.get('/', (c) => {
    return c.text('Hello Hono!')
  })
  app.get('/search/:keyword', async (c) => {
    const { keyword } = c.req.param()
    const tweets = await searchRss(keyword)

    const rss = json2rss({
      title: `Twitter Search: ${keyword}`,
      description: `Twitter Search for ${keyword}`,
      link: `https://x.com/search?q=${keyword}`,
    }, tweets.map(tweet => ({
      title: tweet.text.slice(0, 50),
      link: tweet.url,
      pubDate: tweet.time,
      content: tweet.text,
      author: tweet.author,
      image: tweet.image,
    })))

    return c.body(rss, 200, {
      'Content-Type': 'application/xml',
    })
  })

  const port = 3456
  logger.info(`Server is running on port ${port}`)

  serve({
    fetch: app.fetch,
    port,
  })
}
