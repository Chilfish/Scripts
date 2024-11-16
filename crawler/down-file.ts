import { readFile } from 'node:fs/promises'
import { dir, downloadFiles } from '~/utils/index.node'

const fileList = dir('D:/Downloads/files.txt')
const dest = dir('D:/Downloads/tmp')
const unique = process.argv.includes('--unique')

const data = await readFile(fileList, 'utf-8')
  .then(data => data.replaceAll('\r\n', '\n').split('\n').filter(Boolean))

console.log('Total files:', data.length)

await downloadFiles(data, {
  dest,
  unique,
})

console.log('All images downloaded')
