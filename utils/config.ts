import { loadConfig } from 'c12'
import { dir } from '~/utils/node'

export async function readCookie(
  name: 'twitter' | 'pixiv' | 'bilibili',
) {
  const { config } = await loadConfig({
    configFile: dir('cookie.yaml'),
  })

  return config[name] as string
}
