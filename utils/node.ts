import { execSync } from 'node:child_process'
import { promisify } from 'node:util'
import path from 'node:path'
import { consola } from 'consola'
import { isMacOS, isWindows } from 'std-env'

export const exec = (cmd: string) => promisify(() => execSync(cmd, { stdio: 'inherit' }))().catch(consola.error)

/**
 * Check the filename is same to `tsx path/file.ts`
 */
export function isRunSame() {
  const [_tsx, argFile] = process.argv
  const { filename } = import.meta

  console.log({ filename, argFile })

  return path.resolve(filename) === path.resolve(argFile)
}

export const chromePath = (() => {
  if (isWindows)
    return 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'

  if (isMacOS)
    return '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

  return '/usr/bin/google-chrome'
})()
