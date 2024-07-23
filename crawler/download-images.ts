import { Page } from 'puppeteer'
import { defineCommand, runMain } from 'citty'
import { consola } from 'consola'
import { downloadBlob, newBrowser, prompt } from '~/utils/index.node'
import { devices } from '~/utils'

runMain(defineCommand({
  meta: {
    name: 'download-images',
    description: 'Download images from a webpage via css selector',
  },
  args: {
    url: {
      type: 'string',
      description: 'URL of the webpage',
    },
    selector: {
      type: 'string',
      description: 'CSS selector of the images',
    },
    mobile: {
      type: 'boolean',
      description: 'use mobile window size',
      default: false,
    },
    fetch: {
      type: 'boolean',
      description: 'use fetch instead of puppeteer',
      default: false,
    },
  },
  run: async ({ args }) => {
    let { url, selector, mobile, fetch } = args
    if (!url)
      url = await prompt('Enter URL: ')

    if (fetch) {
      const urls = url.split(', ')
      for (const url of urls)
        await downloadBlob({ url })
      return
    }

    if (!selector)
      selector = await consola.prompt('Enter selector: ') as string
    if (!selector?.trim())
      selector = 'body'

    consola.info(`fetching images from ${url} via ${selector}`)

    await run(url, selector, mobile)

    consola.success('all done')
  },
}))

async function run(
  url: string,
  selector: string,
  isMobile: boolean,
) {
  const device = devices[isMobile ? 'mobile' : 'desktop']
  const { ua, width, height } = device

  const imageSelector = `${selector} img`

  const browser = await newBrowser()
  const page = await browser.newPage()

  await page.setViewport({
    width,
    height,
    isMobile,
  })
  await page.setUserAgent(ua)

  consola.info(`page info`, page.viewport())

  await page.goto(url)
  await page.waitForSelector(imageSelector)

  await downImage(page, imageSelector, url)

  await browser.close()
}

async function downImage(
  page: Page,
  imageSelector: string,
  url: string,
) {
  const { hostname } = new URL(url)

  const imgs: string[] = await page.evaluate((selector) => {
    const elements = Array.from(document.querySelectorAll(selector)) as HTMLImageElement[]
    return elements.map(el => el.getAttribute('src'))
  }, imageSelector)
    .then(urls => Array.from(new Set(urls))
      .filter((src): src is string => !!src)
      .filter(src => !src.endsWith('.svg'))
      .filter(src => !src.includes('base64'))
      .map((src) => {
        if (src.startsWith('//'))
          return `https:${src}`
        else if (src.startsWith('/'))
          return `https://${hostname}${src}`
        return src
      }),
    )
  consola.info(`共有 ${imgs.length} 条`)

  let cnt = 0

  for (const url of imgs) {
    const res = await downloadBlob({ url })
    if (res)
      cnt++
  }

  consola.success(`已下载 ${cnt}`)
}
