import path from 'node:path'
import { defineCommand, runMain } from 'citty'
import { hashFile, prompt } from '~/utils/node'
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
