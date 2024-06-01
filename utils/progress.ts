import readline from 'node:readline'
import consola from 'consola'

export interface ProgressOptions {
  current: number
  total: number
  otherText?: string
  offset?: number
  /**
   * 格式化进度信息的函数
   */
  formatter?: (num: number) => string
}

/**
 * 一个简单的进度条
 */
export function updateProgress(
  options: ProgressOptions,
) {
  const {
    current,
    total,
    otherText = '',
    offset = 0,
    formatter = num => num.toString(),
  } = options

  const width = 50
  const progress = current / total
  const completed = Math.round(width * progress)
  const remaining = width - completed

  process.env.PROGRESS = 'true'

  readline.cursorTo(process.stdout, 0, offset) // 移动到进度条位置
  readline.clearScreenDown(process.stdout) // 清空光标下方的内容

  const progressBar = `[${'='.repeat(completed)}>${' '.repeat(remaining)}]`
  const percentage = Math.round(progress * 100)

  process.stdout.write(`Progress: ${progressBar} ${percentage}% (${formatter(current)}/${formatter(total)})\n`)

  if (otherText)
    consola.info(otherText)

  if (current === total)
    process.stdout.write('\n') // 完成后换行
}
