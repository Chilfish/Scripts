import path from 'node:path'
import { readFile } from 'node:fs/promises'
import { defineCommand, runMain } from 'citty'
import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { logger, newBrowser, root } from '../utils/node'
import { buildSearchParam, devices, getCookie } from '../utils'
import { json2rss } from '../utils/rss'

const cssSelector = `article[data-testid="tweet"]`

const cookies = await readFile(path.resolve(root, 'cookie.txt'), 'utf-8')
  .then(data => getCookie(data))

export async function search(url: string) {
  const browser = await newBrowser()
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

  await page.waitForSelector(cssSelector)

  const tweets = await page.$$eval(cssSelector, (articles) => {
    return articles.map((article) => {
      const tweetText = article.querySelector(`div[data-testid="tweetText"]`)
      const tweetTime = article.querySelector(`time`)
      const author = article.querySelector(`div[data-testid="User-Name"] a`)
      const url = tweetTime?.parentElement?.getAttribute('href')

      return {
        author: author?.textContent?.trim() || 'Unknown',
        text: tweetText?.textContent?.trim() || 'No text',
        time: tweetTime?.dateTime || new Date().toISOString(),
        url: url ? `https://x.com${url}` : 'https://x.com',
      }
    })
  })

  await browser.close()

  return tweets
}

export async function searchRss(
  keyword: string,
) {
  // https://twitter.com/search?q=--&src=recent_search_click&f=live
  return await search(`https://x.com/search?${buildSearchParam({
    q: keyword,
    src: 'recent_search_click',
    f: 'live',
 })}`)
    .catch((err) => {
      logger(`[twitter-rss]: ${err}`, 'error', true)
      return []
    })
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
      const tweets = await searchRss(keyword)
      console.log(tweets)
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
      title: tweet.author,
      link: tweet.url,
      pubDate: tweet.time,
      content: tweet.text,
      author: tweet.author,
    })))

    return c.body(rss, 200, {
      'Content-Type': 'application/xml',
    })
  })

  const port = 3456
  console.log(`Server is running on port ${port}`)

  serve({
    fetch: app.fetch,
    port,
  })
}
