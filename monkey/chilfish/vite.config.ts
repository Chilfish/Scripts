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
    'version': '2025.06.01',
    'run-at': 'document-end',
  },
})
