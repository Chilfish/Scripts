import path from 'node:path'
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

export async function writeJson(
  file: string,
  data: any,
  mode: 'write' | 'append' = 'write',
) {
  if (!path.isAbsolute(file))
    file = path.resolve(root, file)

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
  if (!path.isAbsolute(file))
    file = path.resolve(root, file)

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
