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
  },
}))
