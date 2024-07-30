import path from 'node:path'
import fs from 'node:fs'
import readline from 'node:readline'
import { execSync } from 'node:child_process'
import { LogType, consola } from 'consola'
import { now } from './date'

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
export function isInCli(filename: string) {
  const [_tsx, argFile] = process.argv

  return path.resolve(filename) === path.resolve(argFile)
}

type LogMessage = any

export const logger = {
  info: (message: LogMessage, file = false) => log(message, 'info', file),
  success: (message: LogMessage, file = false) => log(message, 'success', file),
  warn: (message: LogMessage, file = false) => log(message, 'warn', file),
  error: (message: LogMessage, file = false) => log(message, 'error', file),
  debug: (message: LogMessage, file = false) => log(message, 'debug', file),
}

export function log(
  message: LogMessage,
  type: LogType = 'info',
  file = false,
) {
  if (typeof message === 'object') {
    message = JSON.stringify(message, null, 2)
  }

  const log = `${now()} [${type.toUpperCase()}] ${message}\n`
  if (file) {
    const logPath = path.resolve('D:/logs/scripts.log')
    fs.appendFileSync(logPath, log, { encoding: 'utf-8' })
  }
  if (process.env.PROGRESS !== 'true') {
    consola[type](message)
    return log
  }

  // 保存当前光标位置
  readline.cursorTo(process.stdout, 0)
  readline.moveCursor(process.stdout, 0, -1) // 移动到进度条上方
  consola[type](message)
  // 重新打印进度条
  readline.cursorTo(process.stdout, 0)
  readline.moveCursor(process.stdout, 0, 1) // 移动回进度条位置

  return log
}
