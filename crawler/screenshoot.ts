import path from 'node:path'
import puppeteer, { type Page } from 'puppeteer'
import { consola } from 'consola'
import { defineCommand, runMain } from 'citty'

import { devices, prompt } from '../utils'

runMain(defineCommand({
  meta: {
    name: 'screenshoot',
    description: 'take a screenshot of a page',
  },
  args: {
    url: {
      type: 'string',
      description: 'the url of the page',
    },
    selector: {
      type: 'string',
      description: 'the element to be waited for',
      default: 'img',
    },
    element: {
      type: 'string',
      description: 'the element to be screenshotted',
      default: 'body',
    },
    mobile: {
      type: 'boolean',
      description: 'use mobile window size',
      default: false,
    },
    fullscreen: {
      type: 'boolean',
      description: 'take a fullscreen screenshot',
      default: false,
    },
    size: {
      type: 'string',
      description: 'the size of the screenshot, e.g. 1920x1080',
    },
  },
  run: async ({ args }) => {
    let { url, selector, element, mobile, fullscreen, size } = args
    if (!url?.trim())
      url = await prompt('Enter URL: ')

    const device = devices[mobile ? 'mobile' : 'desktop']
    let { ua, width, height } = device
    if (size) {
      const [w, h] = size.split('x').map(Number)
      if (w && h) {
        width = w
        height = h
      }
    }

    consola.info(`device: `, { ua, width, height })

    const browser = await puppeteer.launch()
    const page = await browser.newPage()

    await page.setUserAgent(ua)
    await page.setViewport({
      width,
      height,
      isMobile: mobile,
    })
    await page.emulateMediaFeatures([{
      name: 'prefers-color-scheme',
      value: 'light',
    }])

    await page.goto(url)
    await page.waitForSelector(selector)

    if (element !== 'body')
      await page.waitForSelector(element)

    await screenshot(page, url, element, fullscreen)

    await browser.close()
  },
}))

async function screenshot(
  page: Page,
  url: string,
  element: string,
  fullscreen = false,
) {
  consola.info('taking screenshot...')
  const { hostname } = new URL(url)
  const filename = path.resolve('D:/downloads', `${hostname}-${Date.now()}.png`)

  if (!fullscreen && element === 'body') {
    await page.screenshot({ path: filename })
    consola.success(`screenshot saved as ${filename}`)
    return
  }

  const el = await page.$(element)
  if (!el) {
    consola.error('element not found')
    return
  }

  const box = await el.boundingBox()
  if (!box) {
    consola.error('element has no box')
    return
  }

  const { x, y, width, height } = box
  await page.screenshot({
    path: filename,
    clip: {
      x,
      y,
      width,
      height,
    },
  })

  consola.success(`screenshot saved as ${filename}`)
}
