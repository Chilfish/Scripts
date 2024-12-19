import { writeFile } from 'node:fs/promises'
import { fetchIntercept, newBrowser } from '~/utils/nodejs'

const name = process.argv[2] || 'elonmusk'
const url = `https://x.com/${name}`

console.log(`Crawling ${url}...`)

const browser = await newBrowser()
const data = await fetchIntercept(browser, url, '/UserTweets')
  .then(res => res.data.user.result.timeline_v2.timeline.instructions[2].entries)
  .finally(() => browser.close())

console.log(`Fetched ${data.length} tweets`)

interface User {
  id: string
  name: string
  screenName: string
  avatar: string
}

interface UserInfo extends User {
  bio: string
  location: string
  url: string
  joinDate: string
  followers: number
  following: number
  tweets: number
}

interface Tweet {
  id: string
  text: string
  media: string[]
  date: string
}

function parseTweet(data: any): Tweet {
  const tweetData = data.content.itemContent.tweet_results.result.legacy

  return {
    id: tweetData.id_str,
    date: tweetData.created_at,
    text: tweetData.full_text,
    media: tweetData.entities.media?.map((media: any) => media.media_url_https) || [],
  }
}

function parseUser(data: any): UserInfo {
  let userData = data.content.itemContent.tweet_results.result.core.user_results.result

  const uid = userData.rest_id
  userData = userData.legacy

  return {
    id: uid,
    name: userData.name,
    screenName: userData.screen_name,
    avatar: userData.profile_image_url_https,
    bio: userData.description,
    location: userData.location,
    url: userData.url,
    joinDate: userData.created_at,
    followers: userData.followers_count,
    following: userData.friends_count,
    tweets: userData.statuses_count,
  }
}

const tweets = data.map(parseTweet).sort((a: any, b: any) => a.date.localeCompare(b.date))
const user = parseUser(data[0])

await writeFile('data.json', JSON.stringify({ tweets, user }, null, 2))
