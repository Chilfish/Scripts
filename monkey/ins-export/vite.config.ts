import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import monkey from 'vite-plugin-monkey'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../')

const name = 'ins-exporter'

const repo = 'https://github.com/Chilfish/Scripts/raw/main/monkey'
const downloadURL = `${repo}/${name}.user.js`
const updateURL = `${repo}/${name}.meta.js`

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '~': `${root}`,
    },
  },
  build: {
    outDir: path.resolve(root, 'monkey'),
  },
  plugins: [
    monkey({
      entry: 'main.ts',
      userscript: {
        name,
        description: 'Export Instagram posts',
        icon: 'https://www.instagram.com/static/images/ico/favicon-192.png/68d99ba29cc8.png',
        namespace: 'chilfish/monkey',
        match: [
          'https://www.instagram.com/*',
        ],
        version: '2024.05.30',
        downloadURL,
        updateURL,
      },
      server: {
        open: false,
      },
      build: {
        fileName: `${name}.user.js`,
        metaFileName: true,
      },
    }),
  ],
  server: {
    // in monkey script, we should reload the page manually
    hmr: false,
  },
})
