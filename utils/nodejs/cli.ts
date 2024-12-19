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
  description: string
  shortKey?: string
  defaultValue?: T
  type?: 'string' | 'number' | 'boolean'
  beforeSet?: (value: T) => T
}

type GetType<T> =
  T extends { type: infer U }
    ? U extends 'number'
      ? number
      : U extends 'string'
        ? string
        : U extends 'boolean'
          ? boolean
          : unknown
    : string | undefined

type Result<T extends ArgvOption[]> = {
  [P in T[number]['key']]: GetType<
    Extract<T[number], { key: P }>
  >
}

/**
 * A simple command line argument parser.
 */
export function argvParser<T extends ArgvOption[]>(options: T) {
  const argv: Record<string, any> = {}

  for (let i = 2; i < process.argv.length; i++) {
    const arg = process.argv[i]
    if (!arg.startsWith('-'))
      continue

    const sliceLen = arg.startsWith('--') ? 2 : 1
    const key = arg.slice(sliceLen)

    if (key === 'help' || key === 'h') {
      _printHelp(options)
      process.exit(0)
    }

    const value = process.argv[i + 1]
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

  argv.help = () => _printHelp(options)

  return argv as Result<T> & { help: () => void }
}

function _printHelp(options: ArgvOption[]) {
  console.log('Options:')
  for (const option of options) {
    const shortKey = option.shortKey ? `-${option.shortKey}, ` : ''
    console.log(`  --${option.key}, ${shortKey}${option.description}`)
  }
}

function try2Number(
  value: string | undefined,
  type?: 'string' | 'number' | 'boolean',
) {
  const val = Number(value)

  if (type === 'number') {
    return Number.isNaN(val) ? 0 : val
  }

  const trueValues = ['true', 'yes', 'y']
  if (type === 'boolean') {
    return Number.isNaN(val)
      ? trueValues.includes(value as string)
      : Boolean(val)
  }
  return value
}
