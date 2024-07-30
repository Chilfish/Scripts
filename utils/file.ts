import path from 'node:path'
import os from 'node:os'
import { existsSync } from 'node:fs'
import {
  appendFile,
  mkdir,
  readFile,
  readdir,
  rename,
  stat,
  writeFile,
} from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

export const root = path.resolve(fileURLToPath(import.meta.url), '../../')

interface DirOptions {
  path: string
  root?: boolean
  user?: boolean
}

export function dir(options: string | DirOptions): string {
  let _path = ''

  if (typeof options !== 'string') {
    if (options.root)
      _path = path.resolve(root, options.path)
    else if (options.user)
      _path = path.resolve(os.homedir(), options.path)
    else
      _path = path.resolve(options.path)
  }
  else {
    if (path.isAbsolute(options))
      _path = options
    else
      _path = path.resolve(root, options)
  }

  const isFile = !!_path.split('/').at(-1)?.includes('.')
  const _dir = isFile ? path.dirname(_path) : _path

  if (!existsSync(_dir)) {
    mkdir(_dir, { recursive: true })
  }

  // if (isFile && !existsSync(_path))
  // logger.warn(`File not found: ${_path}`)

  return _path
}

export async function writeJson(
  file: string,
  data: any,
  mode: 'write' | 'append' = 'write',
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
    data = JSON.stringify(data, null, 2)
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
