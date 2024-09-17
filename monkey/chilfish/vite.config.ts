import { viteConfig } from '../common'

export default viteConfig({
  name: 'Chilfish\'s script',
  filename: 'chilfish',
  entry: 'main.ts',
  userscript: {
    'description': 'Chilfish\'s script',
    'icon': 'https://github.com/chilfish.png',
    'match': [
      '*://*/*',
    ],
    'version': '2024.09.17-rc1',
    'run-at': 'document-end',
  },
})
