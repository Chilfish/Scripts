import { defineConfig } from 'vite'
import monkey from 'vite-plugin-monkey'
import { getMonkeyMeta, monkeyOption, viteConfig } from '../../vite.config.base'

const meta = getMonkeyMeta('hello')

export default defineConfig({
  ...viteConfig,
  plugins: [
    // https://github.com/lisonge/vite-plugin-monkey/issues/1#issuecomment-1124478973
    monkey({
      ...monkeyOption,
      entry: 'src/main.ts',
      userscript: {
        ...meta,
        name: 'Vite + Monkey Starter',
        description: 'Starter for monkey scripts.',
        icon: 'https://vitejs.dev/logo.svg',
        match: [
          'https://duckduckgo.com/',
        ],
      },
    }),
  ],
})
