import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { defineConfig } from 'tsdown'

const root = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  entry: [
    'cli/*.ts',
    'crawler/twitter/rss.ts',
  ],
  clean: true,
  alias: {
    '~': root,
  },
})
