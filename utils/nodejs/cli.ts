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
  default?: T
  type?: 'string' | 'number' | 'boolean' | 'enum'
  // Add enum values array for enum type
  enumValues?: string[]
  required?: boolean
  beforeSet?: (value: T) => T
}

type GetOptionType<T extends ArgvOption> =
  T extends { type: 'number' } ? number :
    T extends { type: 'boolean' } ? boolean :
      T extends { type: 'string' } ? string :
        T extends { type: 'enum' } ?
          T extends { enumValues: readonly string[] } ?
            T['enumValues'][number] : string : string

type GetOptionValue<T extends ArgvOption> =
  T extends { required: true } ? GetOptionType<T> :
    T extends { default: any } ? GetOptionType<T> :
      GetOptionValue<T> | undefined

export type OptionsResult<T extends ArgvOption[]> = {
  [P in T[number] as P['key']]: GetOptionValue<P>
}

/**
 * A simple command line argument parser.
 */
export function argvParser<T extends ArgvOption[]>(options: T) {
  const argv: Record<string, any> = {}

  if (process.argv.length <= 2 && options.some(option => option.required)) {
    const required = options.filter(option => option.required)
    console.error('Missing required arguments:', required.map(o => o.key).join(', '))

    console.warn('Usage:')
    _printHelp(options)
    process.exit(1)
  }

  for (let i = 2; i < process.argv.length; i++) {
    const arg = process.argv[i]

    const sliceLen = arg.startsWith('--') ? 2 : 1
    const key = arg.slice(sliceLen)

    if (key === 'help' || key === 'h') {
      _printHelp(options)
      process.exit(0)
    }

    const value = process.argv[i + 1]
    const option = options.find(option => option.key === key || option.shortKey === key)
    if (!option) {
      continue
    }

    if (option.required && (
      value?.startsWith('-') || value === undefined
    )) {
      console.error(`Missing value for option: ${option.key}`)
      console.warn('Usage:')
      _printHelp(options)
      process.exit(1)
    }

    if (option.type === 'boolean' && value === undefined) {
      argv[option.key] = true
    }
    else if (option.type !== 'enum') {
      argv[option.key] = try2Number(value, option.type)
    }
    else {
      if (option.enumValues?.includes(value as string)) {
        argv[option.key] = value
      }
      else {
        console.error(`Invalid value for option: ${option.key}`)
        console.warn('Usage:')
        _printHelp(options)
        process.exit(1)
      }
    }
  }

  for (const option of options) {
    if (argv[option.key] === undefined)
      argv[option.key] = option.default

    if (typeof option.beforeSet === 'function') {
      argv[option.key] = option.beforeSet(argv[option.key])
    }
  }

  return argv as OptionsResult<T>
}

function _printHelp(options: ArgvOption[]) {
  console.log('Options:')
  for (const option of options) {
    const shortKey = option.shortKey ? `-${option.shortKey}, ` : ''
    const required = option.required ? '(required), ' : ''
    console.log(`  --${option.key}, ${shortKey}${required}${option.description}`)
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
