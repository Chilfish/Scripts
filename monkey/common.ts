import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig, UserConfig } from 'vite'
import mkcert from 'vite-plugin-mkcert'
import monkey, { MonkeyOption } from 'vite-plugin-monkey'
import { version } from '../package.json'

export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../')

export const desktop = path.resolve(os.homedir(), 'Desktop')

export const icon = 'https://unavatar.io/chilfish'

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

  const moduleDir = path.resolve(import.meta.dirname, filename)
  console.log('moduleDir', moduleDir)

  return defineConfig({
    ...viteConfig,
    resolve: {
      alias: {
        '~': `${root}`,
        '@': moduleDir,
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
          author: 'Chilfish',
          namespace: 'chilfish/monkey',
          downloadURL,
          updateURL,
          version,
          icon,
          ...monkeyConfig.userscript,
        },
        server: {
          open: false,
        },
        build: {
          ...monkeyConfig.build,
          fileName: `${filename}.user.js`,
          metaFileName: true,
        },
      }),
      mkcert(),
    ],
    server: {
      ...viteConfig?.server,
      // in monkey script, we should reload the page manually
      hmr: false,
    },
  })
}
