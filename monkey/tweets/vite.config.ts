import { viteConfig } from '../common'

export default viteConfig({
  name: '推特小工具',
  filename: 'twitter-utils',
  entry: 'main.ts',
  userscript: {
    'grant': ['unsafeWindow'],
    'run-at': 'document-start',
    'description': '推特小工具',
    'icon': 'https://abs.twimg.com/favicons/twitter.ico',
    'match': [
      'https://twitter.com/*',
      'https://x.com/*',
    ],
    'require': [
      'https://cdn.jsdelivr.net/npm/dayjs@1.11.10/dayjs.min.js',
      'https://cdn.jsdelivr.net/npm/@preact/signals-core@1.5.1/dist/signals-core.min.js',
    ],
  },
  build: {
    externalGlobals: {
      'dayjs': 'dayjs',
      '@preact/signals-core': 'preactSignals',
    },
  },
})
