import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import monkey, { MonkeyOption } from 'vite-plugin-monkey'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../')

/**
 * define vite config for monkey script
 */
export function viteConfig(
  monkeyConfig: MonkeyOption & {
    name: string
    filename: string
  },
) {
  const { name, filename } = monkeyConfig
  const repo = 'https://github.com/Chilfish/Scripts/raw/main/monkey'
  const downloadURL = `${repo}/${filename}.user.js`
  const updateURL = `${repo}/meta/${filename}.meta.js`

  return defineConfig({
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
        ...monkeyConfig,
        userscript: {
          name,
          namespace: 'chilfish/monkey',
          downloadURL,
          updateURL,
          ...monkeyConfig.userscript,
        },
        server: {
          open: false,
        },
        build: {
          fileName: `${filename}.user.js`,
          metaFileName: true,
        },
      }),
    ],
    server: {
    // in monkey script, we should reload the page manually
      hmr: false,
    },
  })
}
