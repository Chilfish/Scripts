import { exec } from 'node:child_process'
import path from 'node:path'
import readline from 'node:readline'
import { fileURLToPath } from 'node:url'
import type { LogType } from 'consola'
import consola from 'consola'
import { isMacOS, isWindows } from 'std-env'

export const root = path.resolve(fileURLToPath(import.meta.url), '../../')

export async function runCommand(command: string) {
  return new Promise<string>((resolve, reject) => {
    const cmd = exec(command)
    let output = ''
    cmd.stdout?.on('data', data => output += data)
    cmd.stderr?.on('data', data => output += data)
    cmd.on('close', () => resolve(output))
    cmd.on('error', error => reject(error))
  })
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

/**
 * 一个简单的进度条
 */
export function updateProgress(
  current: number,
  total: number,
  otherText = '',
) {
  const width = 50
  const progress = current / total
  const completed = Math.round(width * progress)
  const remaining = width - completed

  process.env.PROGRESS = 'true'

  readline.cursorTo(process.stdout, 0, 0) // 移动光标到第一行
  readline.clearScreenDown(process.stdout) // 清空光标下方的内容

  const progressBar = `[${'='.repeat(completed)}>${' '.repeat(remaining)}]`
  const percentage = Math.round(progress * 100)

  process.stdout.write(`Progress: ${progressBar} ${percentage}% (${current}/${total})\n`)

  if (otherText)
    consola.info(otherText)

  if (current === total)
    process.stdout.write('\n') // 完成后换行
}
