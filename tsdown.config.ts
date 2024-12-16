import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'tsdown'

const root = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  entry: [
    'cli/*.ts',
    'crawler/*.ts',
  ],
  clean: true,
  alias: {
    '~': root,
  },
})
