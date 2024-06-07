import path from 'node:path'
import readline from 'node:readline'
import { execSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { createHash } from 'node:crypto'
import { createReadStream } from 'node:fs'
import { stat } from 'node:fs/promises'

import { LogType, consola } from 'consola'
import { isMacOS, isWindows } from 'std-env'

export const root = path.resolve(fileURLToPath(import.meta.url), '../../')

export async function prompt(msg: string) {
  const ans = await consola.prompt(msg) as string

  if (!ans?.trim())
    return await prompt(msg)

  return ans
}

export async function runCommand(command: string) {
  try {
    const output = execSync(command, { stdio: 'inherit' })
    return output.toString('utf-8')
  }
  catch (e: any) {
    return e.toString()
  }
}

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

export function logger(
  message: string,
  type: LogType = 'info',
) {
  if (process.env.PROGRESS !== 'true') {
    consola[type](message)
    return
  }

  // 保存当前光标位置
  readline.cursorTo(process.stdout, 0)
  readline.moveCursor(process.stdout, 0, -1) // 移动到进度条上方
  consola[type](message)
  // 重新打印进度条
  readline.cursorTo(process.stdout, 0)
  readline.moveCursor(process.stdout, 0, 1) // 移动回进度条位置
}

export async function hashFile(
  path: string,
): Promise<{ hash: string, size: number }> {
  const fileSize = (await stat(path)).size
  const chunkSize = 1024 * 1024 * 100 // 100MB

  const hash = createHash('sha256')
  const stream = createReadStream(path, {
    highWaterMark: chunkSize,
  })

  stream.on('data', (data) => {
    hash.update(data)
  })

  return new Promise((resolve, reject) => {
    stream.on('end', () => {
      resolve({
        hash: hash.digest('hex'),
        size: fileSize,
      })
    })
    stream.on('error', reject)
  })
}
