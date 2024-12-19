import { existsSync } from 'node:fs'
import {
  appendFile,
  mkdir,
  readdir,
  readFile,
  rename,
  stat,
  writeFile,
} from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

export const root = path.resolve(fileURLToPath(import.meta.url), '../../')

interface DirOptions {
  path: string
  user?: boolean
}

export function dir(options: string | DirOptions): string {
  let _path = ''

  if (typeof options !== 'string') {
    if (options.user)
      _path = path.resolve(os.homedir(), options.path)
    else
      _path = path.resolve(root, options.path)
  }
  else {
    if (path.isAbsolute(options))
      _path = options
    else
      _path = path.resolve(root, options)
  }

  const _dir = path.dirname(_path)

  if (!existsSync(_dir)) {
    mkdir(_dir, { recursive: true })
  }

  return _path
}

export function baseDir(options: string | DirOptions) {
  const base = dir(options)

  return (sub: string) => {
    const _path = path.resolve(base, sub)

    if (!existsSync(_path)) {
      mkdir(_path, { recursive: true })
    }

    return _path
  }
}

export async function writeJson(
  file: string,
  data: any,
  mode: 'write' | 'append' = 'write',
  indent = 2,
) {
  file = dir(file)

  if (data instanceof Map) {
    data = Object.fromEntries([...data.entries()])
  }
  else if (data instanceof Set) {
    data = [...data]
  }

  // console.log(`Writing to ${file}`)

  if (mode === 'write') {
    data = JSON.stringify(data, null, indent)
    await writeFile(file, data)
  }
  else {
    data = `${JSON.stringify(data)},\n`
    await appendFile(file, data)
  }

  return file
}

export async function readJson<T = any>(file: string) {
  file = dir(file)

  const data = await readFile(file, 'utf-8')
  return JSON.parse(data) as T
}

export async function moveFoler(
  from: string,
  to: string,
) {
  if (!existsSync(to))
    await mkdir(to, { recursive: true })

  const files = await readdir(from)

  for (const file of files) {
    const oldPath = `${from}/${file}`
    const newPath = `${to}/${file}`

    const stats = await stat(oldPath)
    if (stats.isDirectory())
      await moveFoler(oldPath, newPath)
    else
      await rename(oldPath, newPath)

    // await fs.rmdir(from)
  }
}

export async function cachedData<T>(
  dest: string,
  getter: () => Promise<T>,
) {
  try {
    return await readJson<T>(dest)
  }
  catch {
    const data = await getter()
    await writeJson(dest, data)
    return data
  }
}
