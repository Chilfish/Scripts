import path from 'node:path'
import os from 'node:os'
import { fileURLToPath } from 'node:url'
import { UserConfig, defineConfig } from 'vite'
import monkey, { MonkeyOption } from 'vite-plugin-monkey'
import { version } from '../package.json'

export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../')

export const desktop = path.resolve(os.homedir(), 'Desktop')

/**
 * define vite config for monkey script
 */
export function viteConfig(
  monkeyConfig: MonkeyOption & {
    name: string
    filename: string
  },
  viteConfig?: UserConfig,
) {
  const { name, filename } = monkeyConfig
  const repo = 'https://github.com/Chilfish/Scripts/raw/main/monkey'
  const downloadURL = `${repo}/${filename}.user.js`
  const updateURL = `${repo}/meta/${filename}.meta.js`

  return defineConfig({
    ...viteConfig,
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
          version,
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
      ...viteConfig?.server,
      // in monkey script, we should reload the page manually
      hmr: false,
    },
  })
}
