import { execSync } from 'node:child_process'
import path from 'node:path'
import { consola } from 'consola'

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
 * Check if the script is not imported
 *
 * @example
 * ```ts
 * isInCli(import.meta.filename)
 * ```
 */
export function isNotInImport(importMetaFilename: string) {
  const [_tsx, argFile] = process.argv

  return path.resolve(importMetaFilename) === path.resolve(argFile)
}

export interface ArgvOption<T = any> {
  key: string
  shortKey: string
  description: string
  defaultValue?: T
  type?: 'string' | 'number' | 'boolean'
  beforeSet?: (value: T) => T
}

/**
 * A simple command line argument parser.
 */
export class Argv {
  static parse<T extends ArgvOption[]>(options: T) {
    const argv: Record<string, any> = { help: false }

    for (let i = 2; i < process.argv.length; i++) {
      const arg = process.argv[i]
      if (!arg.startsWith('-'))
        continue

      const sliceLen = arg.startsWith('--') ? 2 : 1
      const key = arg.slice(sliceLen)

      if (key === 'help' || key === 'h') {
        argv.help = true
        break
      }

      const value = process.argv[i + 1] || true
      const option = options.find(option => option.key === key || option.shortKey === key)
      if (option) {
        argv[option.key] = try2Number(value, option.type)
      }
    }

    for (const option of options) {
      if (argv[option.key] === undefined)
        argv[option.key] = option.defaultValue

      if (typeof option.beforeSet === 'function') {
        argv[option.key] = option.beforeSet(argv[option.key])
      }
    }

    return argv as {
      [K in T[number]['key']]: T[number]['defaultValue']
    }
  }

  static init<T extends ArgvOption[]>(options: T) {
    return Argv.parse(options)
  }
}

function try2Number(value: string | boolean | undefined, type?: 'string' | 'number' | 'boolean') {
  if (type === 'number') {
    return Number.isNaN(Number(value)) ? 0 : Number(value)
  }
  if (type === 'boolean') {
    return value === 'true'
  }
  return value
}
