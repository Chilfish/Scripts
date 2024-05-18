import puppeteer from 'puppeteer'
import type { Browser } from 'puppeteer'
import { chromePath } from './index'

export async function newBrowser() {
  return await puppeteer.launch({
    headless: 'shell',
    executablePath: chromePath,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })
}

export async function fetchIntercept<T = any>(
  browser: Browser,
  url: string,
  match: string,
) {
  const page = await browser.newPage()
  await page.goto(url, {
    waitUntil: 'domcontentloaded',
  })

  return await page.waitForResponse(res =>
  // FIX ProtocolError: Could not load body for this request. This might happen if the request is a preflight request.
    res.request().method().toUpperCase() !== 'OPTIONS'
    && res.url().includes(match),
  )
    .then(res => res.json() as Promise<T>)
    .finally(() => page.close())
}
