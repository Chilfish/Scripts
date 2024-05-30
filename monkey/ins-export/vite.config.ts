import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import monkey from 'vite-plugin-monkey'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../')

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '~': `${root}`,
    },
  },
  plugins: [
    // https://github.com/lisonge/vite-plugin-monkey/issues/1#issuecomment-1124478973
    monkey({
      entry: 'main.ts',
      userscript: {
        name: 'ins-exporter',
        description: 'Export Instagram posts',
        icon: 'https://www.instagram.com/static/images/ico/favicon-192.png/68d99ba29cc8.png',
        namespace: 'chilfish/monkey',
        match: [
          'https://www.instagram.com/*',
          'https://www.instagram.com/*/*',
        ],
      },
      server: {
        open: false,
      },
    }),
  ],
  server: {
    // in monkey script, we should reload the page manually
    hmr: false,
  },
})
