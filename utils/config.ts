import { loadConfig } from 'c12'
import { dir } from '~/utils/node'

const { config } = await loadConfig({
  configFile: dir('config.yaml'),
})

export function readCookie(
  name: 'twitter' | 'pixiv' | 'bilibili',
) {
  return config.cookie[name] as string
}

export const openaiKey = config.openaiKey as string
