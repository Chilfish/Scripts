import { viteConfig } from '../common'

export default viteConfig({
  name: 'Chilfish\'s script',
  filename: 'chilfish',
  entry: 'main.ts',
  userscript: {
    'description': 'Chilfish\'s script',
    'match': [
      '*://*/*',
    ],
    'version': '2024.09.18',
    'run-at': 'document-end',
  },
})
