import path from 'node:path'
import { createHash } from 'node:crypto'
import { createReadStream } from 'node:fs'
import { stat } from 'node:fs/promises'
import { defineCommand, runMain } from 'citty'
import { prompt } from '~/utils/cli'
import { fmtFileSize } from '~/utils'

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
    isSame: {
      type: 'boolean',
      description: 'compare the hash of two files',
    },
  },
  run: async ({ args }) => {
    let { file, isSame } = args
    let file2: string

    if (!file?.trim())
      file = await prompt('Enter the path to the file:')

    file = normalizePath(file)
    if (isSame) {
      file2 = await prompt('Enter the path to the second file:')
      file2 = normalizePath(file2)

      const same = await isSameFile(file, file2)
      console.log(`Hash1: ${same.hash1}`)
      console.log(`Hash2: ${same.hash2}`)
      console.log(`Is same: ${same.isSame}`)
      return
    }

    console.log(`Hashing ${file}...`)

    const { hash, size } = await hashFile(file)
    console.log(`Hash: ${hash}`)
    console.log(`Size: ${fmtFileSize(size)}`)
  },
}))

function normalizePath(file: string) {
  file = file
    .replace(/\\/g, '/') // windows path
    .replace(/[`"]/g, '') // powershell escape

  if (!path.isAbsolute(file))
    file = path.resolve(file)

  return file
}

async function isSameFile(file1: string, file2: string) {
  const { hash: hash1 } = await hashFile(file1)
  const { hash: hash2 } = await hashFile(file2)
  return {
    isSame: hash1 === hash2,
    hash1,
    hash2,
  }
}

async function hashFile(
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
