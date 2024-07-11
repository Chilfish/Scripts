import { homedir } from 'node:os'
import path from 'node:path'
import puppeteer, { Browser } from 'puppeteer'
import { isMacOS, isWindows } from 'std-env'
import { proxyUrl } from './constant'

export const chromePath = (() => {
  if (isWindows)
    return 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'

  if (isMacOS)
    return '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

  return '/usr/bin/google-chrome'
})()

export const chromeUserData = (() => {
  if (isWindows)
    return path.join(homedir(), 'AppData/Local/Google/Chrome/User Data/Default')

  if (isMacOS)
    return path.join(process.env.HOME!, 'Library/Application Support/Google/Chrome')

  return path.join(process.env.HOME!, '.config/google-chrome')
})()

export async function newBrowser() {
  return await puppeteer.launch({
    headless: 'shell',
    // headless: false,
    executablePath: chromePath,
    userDataDir: chromeUserData,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      `--proxy-server=${proxyUrl}`,
    ],
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
