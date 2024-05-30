import { consola } from 'consola'

export const sleep = (ms = 1000) => new Promise(resolve => setTimeout(resolve, ms))

export async function prompt(msg: string) {
  const ans = await consola.prompt(msg) as string

  if (!ans?.trim())
    return await prompt(msg)

  return ans
}

/**
 * Format the date string
 * @param input the date string
 * @param format the format string, e.g. `YYYY-MM-DD HH:mm:ss`
 */
export function formatDate(input: string | number | Date, format: string) {
  const date = new Date(input)
  const pad = (num: number) => num.toString().padStart(2, '0')

  const year = date.getUTCFullYear()
  const month = pad(date.getUTCMonth() + 1) // Months are zero-based
  const day = pad(date.getUTCDate())
  const hours = pad(date.getUTCHours())
  const minutes = pad(date.getUTCMinutes())
  const seconds = pad(date.getUTCSeconds())

  return format
    .replace('YYYY', year.toString())
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds)
}
