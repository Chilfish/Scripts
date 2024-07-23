import { defineCommand, runMain } from 'citty'
import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { Browser } from 'puppeteer'
import { buildUrl, checkNetwork, devices, getCookie } from '~/utils'
import { json2rss } from '~/utils/rss'
import { logger } from '~/utils/cli'
import { readCookie } from '~/utils/config'
import { newBrowser } from '~/utils/puppeteer'

const cssSelector = `article[data-testid="tweet"]`

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

  await page.waitForSelector(cssSelector, {
    timeout: 15_000,
  })
    .catch(async () => {
      const text = await page.evaluate(() => document.querySelector('#react-root')?.textContent)
      logger.error(`[twitter-rss]: ${text}`, true)
    })

  await page.evaluate(() => {
    window.scrollBy(0, window.innerHeight)
  })

  const tweets: Tweet[] = await page.$$eval(cssSelector, (articles) => {
    return articles.map((article) => {
      const isAd = article.querySelector('svg.r-4qtqp9.r-yyyyoo.r-dnmrzs.r-bnwqim.r-lrvibr.r-m6rgpd.r-1q142lx.r-ip8ujx.r-1gs4q39.r-14j79pv') !== null
      if (isAd) {
        return null
      }

      const tweetText = article.querySelector(`div[data-testid="tweetText"]`)
      const tweetTime = article.querySelector(`time`)
      const author = article.querySelector(`div[data-testid="User-Name"] a`)
      const url = tweetTime?.parentElement?.getAttribute('href')

      const photos = Array.from(
        article.querySelectorAll(`div[data-testid="tweetPhoto"] img`),
      )
        .map(photo => photo.getAttribute('src'))
        .filter((src): src is string => !!src)

      const cardPhoto = article.querySelector(`div[data-testid="card.wrapper"] img`)?.getAttribute('src')

      return {
        author: author?.textContent?.trim() || 'Unknown',
        text: tweetText?.textContent?.trim() || 'No text',
        time: tweetTime?.dateTime || new Date().toISOString(),
        url: url ? `https://x.com${url}` : 'https://x.com',
        image: cardPhoto || photos[0] || '',
      }
    })
      .filter((tweet): tweet is Tweet => tweet !== null)
  })

  return tweets
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
    return await search(url)
  }
  catch (err: any) {
    let mes = await checkNetwork()
    if (mes === 'ok')
      mes = err.message

    logger.error(`[twitter-rss]: ${mes}`, true)
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

      logger.info(`Found ${tweets.length} tweets`)
      logger.info(tweets)
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
