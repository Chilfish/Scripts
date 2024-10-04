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
  const browser = await puppeteer.launch({
    headless: 'shell',
    // headless: false,
    // executablePath: chromePath,
    // userDataDir: chromeUserData,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      `--proxy-server=${proxyUrl}`,
    ],
  })

  // setTimeout(() => browser.close(), 1000 * 60)

  return browser
}

export async function fetchIntercept<T = any>(
  browser: Browser,
  url: string,
  match: string,
  timeout = 30000, // Add a default timeout
) {
  const page = await browser.newPage()
  try {
    await page.goto(url, {
      waitUntil: 'networkidle0', // Wait until network is idle
      timeout,
    })

    const response = await page.waitForResponse(
      res =>
        res.request().method().toUpperCase() !== 'OPTIONS'
        && res.url().includes(match),
      { timeout },
    )

    // Check if the response is valid
    if (!response.ok()) {
      throw new Error(`HTTP error! status: ${response.status()}`)
    }

    return await response.json() as T
  }
  catch (error) {
    console.error('Error in fetchIntercept:', error)
    throw error // Re-throw the error for the caller to handle
  }
  finally {
    await page.close()
  }
}
