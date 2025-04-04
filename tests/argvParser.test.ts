import type { ArgvOption } from '../utils/nodejs/cli'
import { describe, expect, it } from 'vitest'
import { argvParser } from '../utils/nodejs/cli'

describe('argvParser', () => {
  const createOptions = [
    {
      key: 'flag',
      shortKey: 'f',
      description: 'A boolean flag',
      type: 'boolean',
      default: false,
    },
    {
      key: 'required',
      shortKey: 'r',
      description: 'A required option',
      type: 'string',
      required: true,
    },
    {
      key: 'number',
      shortKey: 'n',
      description: 'A number option',
      type: 'number',
      default: 0,
    },
    {
      key: 'enum',
      shortKey: 'e',
      description: 'An enum option',
      type: 'enum',
      enumValues: ['one', 'two', 'three'],
      default: 'one',
    },
  ] satisfies ArgvOption[]

  it('should parse options correctly', () => {
    const args = ['--required', 'value', '--number', '42']
    const result = argvParser(createOptions, args)

    expect(result.required).toBe('value')
    expect(result.number).toBe(42)
    expect(result.flag).toBe(false)
    expect(result.enum).toBe('one')
  })

  it('should parse short options correctly', () => {
    const args = ['-r', 'value', '-n', '42']
    const result = argvParser(createOptions, args)

    expect(result.required).toBe('value')
    expect(result.number).toBe(42)
  })

  it('should handle boolean flags correctly', () => {
    const args = ['-f', '-r', 'value']
    const result = argvParser(createOptions, args)

    expect(result.flag).toBe(true)
    expect(result.required).toBe('value')
  })

  it('should handle boolean flags in any order', () => {
    const args = ['-r', 'value', '-f']
    const result = argvParser(createOptions, args)

    expect(result.flag).toBe(true)
    expect(result.required).toBe('value')
  })

  it('should handle enum values correctly', () => {
    const args = ['--enum', 'two1']
    expect(() => argvParser(createOptions, args)).toThrowError()
  })

  it('should parse positional arguments correctly', () => {
    const args = ['command123', '123', '-r', 'value']
    const result = argvParser(createOptions, args)

    expect(result.command).toBe('command123')
    expect(result.value).toBe(123)
    expect(result.required).toBe('value')
  })

  it('should handle mixed positional and option arguments in any order', () => {
    const args = ['-r', 'value', 'command123', '123']
    const result = argvParser(createOptions, args)

    expect(result.required).toBe('value')
    expect(result.command).toBe('command123')
    expect(result.value).toBe(123)
  })

  it('should use default values for unspecified options and positionals', () => {
    const args = ['-r', 'value', 'command123']
    const result = argvParser(createOptions, args)

    expect(result.required).toBe('value')
    expect(result.number).toBe(0)
    expect(result.flag).toBe(false)
    expect(result.enum).toBe('one')
    expect(result.value).toBe(42)
    expect(result.command).toBe('command123')
  })

  it('should process number types correctly', () => {
    const args = ['command', '-n', '42.5', '-r', 'value']
    const result = argvParser(createOptions, args)

    expect(result.number).toBe(42.5)
  })
})
