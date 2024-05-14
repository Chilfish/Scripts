import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { MonkeyOption, MonkeyUserScript } from 'vite-plugin-monkey'
import type { UserConfig } from 'vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export const root = path.resolve(__dirname)
export const dist = path.resolve(root, 'dist')
export const shared = path.resolve(root, 'packages/shared/src')

export const viteConfig: UserConfig = {
  resolve: {
    alias: {
      '@shared': shared,
    },
  },
  build: {
    outDir: dist,
  },
}

// https://github.com/lisonge/vite-plugin-monkey/issues/1#issuecomment-1124478973
export function getMonkeyMeta(name: string): MonkeyUserScript {
  const repo = 'https://github.com/Chilfish/Scripts'
  const author = 'Chilfish'
  return {
    homepage: repo,
    author,
    downloadURL: `${repo}/raw/dist/${name}.user.js`,
    updateURL: `${repo}/raw/dist/${name}.meta.js`,
    license: 'MIT',
    namespace: 'chilfish',
  }
}

export const monkeyOption: MonkeyOption = {
  entry: 'src/main.ts',
  server: {
    open: false,
  },
  build: {
    metaFileName: true,
  },
}
