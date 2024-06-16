import path from 'node:path'
import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

export const root = path.resolve(fileURLToPath(import.meta.url), '../../../')

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
  const options: any = { }

  if (mode === 'write') {
    options.flag = 'w'
    data = JSON.stringify(data, null, 2)
  }
  else {
    options.flag = 'a'
    data = `${JSON.stringify(data)},\n`
  }

  await writeFile(file, data, options)

  return file
}

export async function readJson<T = any>(file: string) {
  if (!path.isAbsolute(file))
    file = path.resolve(root, file)

  const data = await readFile(file, 'utf-8')
  return JSON.parse(data) as T
}
