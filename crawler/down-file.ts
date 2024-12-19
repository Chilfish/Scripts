import { readFile } from 'node:fs/promises'
import {
  argvParser,
  dir,
  downloadFiles,
} from '~/utils/nodejs'

const fileList = dir('D:/Downloads/files.txt')
const dest = dir('D:/Downloads/tmp')

const { hash } = argvParser([{
  key: 'hash',
  type: 'boolean',
  description: 'append hash to filename',
}] as const)

const data = await readFile(fileList, 'utf-8')
  .then(data => data.replaceAll('\r\n', '\n').split('\n').filter(Boolean))

console.log('Total files:', data.length)

const isSameFilename = new Set(
  data.map(url => new URL(url).pathname.split('/').pop()!),
)
  .size < data.length - 1

await downloadFiles(data, {
  dest,
  hash: hash || isSameFilename,
  proxy: true,
})

console.log('All images downloaded')
