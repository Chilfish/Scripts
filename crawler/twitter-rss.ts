import path from 'node:path'
import { readFile } from 'node:fs/promises'
import { isInCli, newBrowser, prompt, root } from '../utils/node'
import { buildSearchParam, devices, getCookie } from '../utils'

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
        author: author?.textContent?.trim(),
        text: tweetText?.textContent?.trim(),
        time: tweetTime?.dateTime,
        url: url ? `https://x.com${url}` : undefined,
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
}

if (isInCli(import.meta.filename)) {
  const keyword = await prompt('Enter the keyword: ')
  const tweets = await searchRss(keyword)
  console.log(tweets)
}
