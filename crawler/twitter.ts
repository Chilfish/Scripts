import puppeteer from 'puppeteer'
import { chromePath } from '../utils'

const url = 'https://x.com/aoki__hina'
const apiMatch = '/UserByScreenName'

const browser = await puppeteer.launch({
  headless: 'shell',
  executablePath: chromePath,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
})
const page = await browser.newPage()
await page.goto(url, {
  waitUntil: 'domcontentloaded',
})

const data = await page.waitForResponse(response =>
  // FIX ProtocolError: Could not load body for this request. This might happen if the request is a preflight request.
  response.request().method().toUpperCase() !== 'OPTIONS'
  && response.url().includes(apiMatch),
)
  .then(response => response.json())

console.log(data.data.user.result.legacy)

await page.close()
await browser.close()
