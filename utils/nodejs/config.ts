import { loadConfig } from 'c12'
import { dir } from './file'

interface Config {
  cookie: {
    twitter: string
    pixiv: string
    bilibili: string
    weibo: string
  }
  openai: {
    key: string
    url: string
    model: string
  }
  deepseekKey: string
  prompts: {
    [key: string]: string
  }
  rss: {
    /**
     * RSS 运行间隔，单位为分钟
     */
    interval: number
    folder: string
    maxDuration: number
    urls: string[]
  }
  twitterKey: string
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
