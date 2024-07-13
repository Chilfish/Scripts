import { viteConfig } from '../common'

export default viteConfig({
  name: 'Twitter media downloader',
  filename: 'twitter-media',
  entry: 'main.ts',
  userscript: {
    description: 'Download Twitter media',
    icon: 'https://abs.twimg.com/favicons/twitter.ico',
    match: [
      'https://twitter.com/*',
      'https://x.com/*',
    ],
  },
})
