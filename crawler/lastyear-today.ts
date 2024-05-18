import { defineCommand, runMain } from 'citty'
import { formatDate, prompt } from '../utils'
import screenshot from './screenshoot'

runMain(defineCommand({
  meta: {
    name: 'years-today',
    description: 'Obtain screenshots of tweets from a few years ago today.',
  },
  args: {
    name: {
      type: 'string',
      description: 'The name of the user to obtain tweets from.',
    },
  },
  run: async ({ args }) => {
    let { name } = args
    if (!name)
      name = await prompt('Enter the name:')

    const now = new Date()

    const since = formatDate(now, 'YYYY-MM-DD')
    const until = formatDate(now.setDate(now.getDate() + 1), 'YYYY-MM-DD')

    const url = `https://x.com/search?q=from:${name}%20until:${until}%20since:${since}&f=live&q=-filter%3Areplies&src=typed_query`

    await screenshot({
      url,
      selector: 'section img',
      element: 'section',
      isMobile: false,
      fullscreen: false,
      useCookie: true,
      size: 'default',
    })
  },
}))
