import { loadConfig } from 'c12'
import { dir } from '~/utils/file'

interface Config {
  cookie: {
    twitter: string
    pixiv: string
    bilibili: string
  }
  openai: {
    key: string
    url: string
  }
  prompts: {
    [key: string]: string
  }
}

export const { config } = await loadConfig<Config>({
  configFile: dir('config.yaml'),
})

export function readCookie(
  name: keyof Config['cookie'],
) {
  return config.cookie[name] as string
}

export const openaiConfig = config.openai
