import { readJson } from '~/utils/file'

const data = await readJson('data/twitter/data-after.json')

const replyCount = data.tweets.reduce((acc, tweet) => {
  return acc + tweet.reply_count
}, 0)

console.log(replyCount)
