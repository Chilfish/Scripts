import { consola } from 'consola'

import { defineCommand, runMain } from 'citty'

import puppeteer from 'puppeteer'
import { prompt } from '../utils'

const main = defineCommand({
  meta: {
    name: 'twitter-fans',
    description: 'get twitter fans of a user',
  },
  args: {
    name: {
      type: 'string',
      description: 'Twitter name (used in URL and @name)',
    },
  },
  run: async ({ args }) => {
    let { name } = args
    if (!name)
      name = await prompt('Enter Twitter name: ')

    const url = `https://x.com/${name}`
    const scriptSelector = 'script[data-testid="UserProfileSchema-test"]'

    const browser = await puppeteer.launch()
    const page = await browser.newPage()

    await page.goto(url)
    await page.setViewport({ width: 1080, height: 1024 })

    await page.waitForSelector(scriptSelector)

    const data = await page.evaluate((selector) => {
      const script = document.querySelector(selector)
      if (!script)
        return null

      return JSON.parse(script.innerHTML)
    }, scriptSelector)

    if (!data) {
      consola.error('Failed to fetch twitter fans')
      await browser.close()
      return
    }

    const displyName = data.author.givenName
    const followers = data.author.interactionStatistic[0].userInteractionCount

    consola.info(`Twitter fans of ${displyName}: ${followers}`)

    await browser.close()
  },
})

runMain(main)

// const url = 'https://x.com/i/api/graphql/qW5u-DAuXpMEG0zA1F7UGQ/UserByScreenName'
// const variables = { screen_name, withSafetyModeUserFields: true }
// const features = { hidden_profile_likes_enabled: true, hidden_profile_subscriptions_enabled: true, rweb_tipjar_consumption_enabled: true, responsive_web_graphql_exclude_directive_enabled: true, verified_phone_label_enabled: false, subscriptions_verification_info_is_identity_verified_enabled: true, subscriptions_verification_info_verified_since_enabled: true, highlights_tweets_tab_ui_enabled: true, responsive_web_twitter_article_notes_tab_enabled: true, creator_subscriptions_tweet_preview_api_enabled: true, responsive_web_graphql_skip_user_profile_image_extensions_enabled: false, responsive_web_graphql_timeline_navigation_enabled: true }

// const {
//   X_CSRF_TOKEN: x_csrf_token = '',
//   X_COOKIE: cookie = '',
//   X_AUTH: x_auth = '',
// } = process.env

// const headers = {
//   'cookie': cookie,
//   'x-csrf-token': x_csrf_token,
//   'authorization': `Bearer ${x_auth}`,
// }

// async function fetchTwitterFans() {
//   const { data } = await ofetch(url, {
//     headers,
//     params: {
//       variables,
//       features,
//     },
//   })

//   if (!data) {
//     consola.error('Failed to fetch twitter fans')
//     return
//   }

//   const user = data.user.result
//   const followers = user.legacy.followers_count
//   const name = user.legacy.name

//   const now = new Date().toLocaleString()

//   consola.info(`${now} Twitter fans of ${name}: ${followers}`)
// }

// // fetch every 30 seconds
// fetchTwitterFans()
// setInterval(() => {
//   fetchTwitterFans()
// }, 20 * 1000)
