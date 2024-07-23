import { loadConfig } from 'c12'
import { dir } from '~/utils/file'

const { config } = await loadConfig({
  configFile: dir('config.yaml'),
})

export function readCookie(
  name: 'twitter' | 'pixiv' | 'bilibili',
) {
  return config.cookie[name] as string
}

export const openaiConfig = config.openai as {
  key: string
  url: string
}
