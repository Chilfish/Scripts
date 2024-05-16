import puppeteer from 'puppeteer'
import { defineCommand, runMain } from 'citty'
import { consola } from 'consola'
import { downloadImage, prompt } from '../utils'

const main = defineCommand({
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
  },
  run: async ({ args }) => {
    let { url, selector } = args
    if (!url)
      url = await prompt('Enter URL: ')
    if (!selector)
      selector = await consola.prompt('Enter selector: ') as string
    if (!selector.trim())
      selector = 'body'

    await run(url, selector)
  },
})

async function run(url: string, selector: string) {
  const { hostname } = new URL(url)

  const imageSelector = `${selector} img`

  const browser = await puppeteer.launch()
  const page = await browser.newPage()

  await page.goto(url)
  await page.setViewport({ width: 1080, height: 1024 })

  await page.waitForSelector(imageSelector)

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

  console.log(`共有 ${imgs.length} 条`)

  let cnt = 0

  for (const url of imgs) {
    const res = await downloadImage(url)
    res && cnt++
  }

  console.log(`已下载 ${cnt}`)

  await browser.close()
}

runMain(main)
