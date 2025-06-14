import { viteConfig } from '../common'

export default viteConfig({
  name: '推特小工具',
  filename: 'twitter-utils',
  entry: 'main.ts',
  userscript: {
    'version': '2025.06.01',
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
