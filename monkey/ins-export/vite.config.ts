import { viteConfig } from '../common'

export default viteConfig({
  filename: 'ins-exporter',
  name: 'Instagram Exporter',
  entry: 'main.ts',
  userscript: {
    icon: 'https://www.instagram.com/static/images/ico/favicon-192.png/68d99ba29cc8.png',
    description: 'Export Instagram posts',
    match: [
      'https://www.instagram.com/*',
    ],
    version: '2024.07.03',
  },
})
