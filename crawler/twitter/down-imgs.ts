import { formatDate } from '~/utils/date'
import { downloadFiles } from '~/utils/nodejs/download'
import { readJson, writeJson } from '~/utils/nodejs/file'

const tweets = await readJson('data/tweets.json')
const urls = new Set<string>()

console.log(tweets.length)

const medias = tweets
  .map((tweet: any) => {
    const medias = getMediaUrl(tweet)
    const retweets = getMediaUrl(tweet.retweeted_status)
    const quotes = getMediaUrl(tweet.quoted_status?.tweet)
    const all = [...medias, ...retweets, ...quotes]
    return all
  })
  .flat()

function getMediaUrl(tweet: any) {
  if (!tweet?.media) {
    return []
  }
  if (!Array.isArray(tweet.media)) {
    return []
  }

  return (tweet.media as any[]).map(({ url, type }, idx) => {
    if (!url || urls.has(url)) {
      return null
    }
    urls.add(url)

    const id = tweet.tweet_id || tweet.tweetId || Date.now()
    const suffix = idx ? `-${idx}` : ''
    const craetedAt = formatDate(
      tweet.created_at || tweet.createdAt || Date.now(),
      'YYYYMMDD_HHmmss',
    )
    const ext = type === 'video' ? 'mp4' : 'png'

    const filename = `${id}-${craetedAt}${suffix}.${ext}`

    const largeUrl = new URL(url)

    largeUrl.searchParams.set('format', ext)
    largeUrl.searchParams.set('name', 'large')

    return {
      name: filename,
      url: largeUrl,
    }
  }).filter(Boolean)
}

console.log(medias.length)

await writeJson('data/medias.json', medias)

const downloadDir = process.argv[2] || 'data/medias'
if (!downloadDir) {
  console.error('Please provide a download directory')
  process.exit(1)
}

await downloadFiles(medias, {
  dest: downloadDir,
  proxy: true,
})
