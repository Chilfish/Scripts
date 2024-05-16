import { createReadStream } from 'node:fs'
import { stat } from 'node:fs/promises'
import path from 'node:path'
import { createHash } from 'node:crypto'
import { defineCommand, runMain } from 'citty'
import { fmtFileSize, prompt } from '../utils'

runMain(defineCommand({
  meta: {
    name: 'hash',
    description: 'get the hash of a file',
  },
  args: {
    file: {
      type: 'string',
      description: 'the path to the file',
    },
  },
  run: async ({ args }) => {
    let { file } = args
    if (!file?.trim())
      file = await prompt('Enter the path to the file:')

    file = file
      .replace(/\\/g, '/') // windows path
      .replace(/[`"]/g, '') // powershell escape

    if (!path.isAbsolute(file))
      file = path.resolve(file)

    console.log(`Hashing ${file}...`)

    const { hash, size } = await hashFile(file)
    console.log(`Hash: ${hash}`)
    console.log(`Size: ${fmtFileSize(size)}`)
    console.log(`Memory useage: ${fmtFileSize(process.memoryUsage().rss)}`)
  },
}))

export async function hashFile(
  path: string,
): Promise<{ hash: string, size: number }> {
  const fileSize = (await stat(path)).size
  const chunkSize = 1024 * 1024 * 100 // 100MB

  const hash = createHash('sha256')
  const stream = createReadStream(path, {
    highWaterMark: chunkSize,
  })

  stream.on('data', (data) => {
    hash.update(data)
  })

  return new Promise((resolve, reject) => {
    stream.on('end', () => {
      resolve({
        hash: hash.digest('hex'),
        size: fileSize,
      })
    })
    stream.on('error', reject)
  })
}
