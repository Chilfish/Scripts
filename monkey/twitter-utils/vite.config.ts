import { viteConfig } from '../common'

export default viteConfig({
  name: '推特小工具',
  filename: 'twitter-utils',
  entry: 'main.ts',
  userscript: {
    'version': '2024.10.07-patch1',
    'run-at': 'document-start',
    'description': '推特小工具',
    'icon': 'https://abs.twimg.com/favicons/twitter.ico',
    'match': [
      'https://twitter.com/*',
      'https://x.com/*',
    ],
    'require': [
    ],
  },
  build: {
    externalGlobals: {
    },
  },
})
