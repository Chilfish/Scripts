import path from 'node:path'
import puppeteer, { type Page } from 'puppeteer'
import { consola } from 'consola'
import { defineCommand, runMain } from 'citty'
import { cookieToRecord, devices, prompt } from '../utils'

const app = defineCommand({
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

    await main({
      url,
      selector,
      element,
      isMobile: mobile,
      fullscreen,
      size,
      useCookie: false,
    })
  },
})

interface ScreenshootOptions {
  url: string
  selector: string
  element: string
  isMobile: boolean
  fullscreen: boolean
  size: string
  useCookie: boolean
}

/**
 * take a screenshot of a page
 * @param url the url of the page
 * @param selector the element to be waited for, default to `img`
 * @param element the element to be screenshotted, default to `body`
 * @param isMobile use mobile window size, default to `false`
 * @param fullscreen take a fullscreen screenshot, default to `false`
 * @param size the size of the screenshot, e.g. `1920x1080`
 */
export default async function main(
  options: ScreenshootOptions,
) {
  const { url, selector, element, isMobile, fullscreen, size, useCookie } = options

  const device = devices[isMobile ? 'mobile' : 'desktop']
  let { ua, width, height } = device
  if (size) {
    const [w, h] = size.split('x').map(Number)
    if (w && h) {
      width = w
      height = h
    }
  }

  consola.info(`url: ${url}, selector: ${selector}, element: ${element}`)
  consola.info(`device: `, { ua, width, height })

  const browser = await puppeteer.launch({
    headless: 'shell',
  })
  const page = await browser.newPage()

  await page.setUserAgent(ua)
  await page.setViewport({
    width,
    height,
    isMobile,
  })

  if (useCookie) {
    const cookie = cookieToRecord(await prompt('Enter cookie: '), url)
    await page.setCookie(...cookie)
  }

  await page.goto(url, {
    waitUntil: 'networkidle0',
  })
  await page.waitForSelector(selector)

  await screenshot(page, url, element, fullscreen)
  await browser.close()
}

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

  const el = await page.waitForSelector(element)
  if (!el) {
    consola.error(`element ${element} not found`)
    return
  }

  await el.screenshot({
    path: filename,
  })

  consola.success(`screenshot saved as ${filename}`)
}

if (process.argv[1] === import.meta.filename)
  runMain(app)
