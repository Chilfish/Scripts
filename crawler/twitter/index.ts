import { Rettiwt } from 'rettiwt-api'
import {
  argvParser,
  baseDir,
  cachedData,
  config,
} from '~/utils/nodejs'

const tmp = baseDir('data/twitter')

const { name, help } = argvParser([
  {
    key: 'name',
    shortKey: 'n',
    description: 'The name of the user to fetch tweets from',
  },
] as const)

if (!name) {
  console.error('Missing --name argument')
  help()
  process.exit(1)
}

const rettiwt = new Rettiwt({ apiKey: config.twitterKey })

const user = await cachedData(
  tmp(`users/${name}.json`),
  () => rettiwt.user.details(name),
)

console.log(user)

if (!user) {
  console.error('User not found')
  process.exit(1)
}

const tweets = await cachedData(
  tmp(`tweets/${name}.json`),
  () => rettiwt.user.timeline(user.id),
)

console.log(tweets.list.length)
