import { readFile } from 'node:fs/promises'
import { dir, downloadFiles } from '~/utils/index.node'

const fileList = dir('D:/Downloads/files.txt')
const dest = dir('D:/Downloads/tmp')
const hash = process.argv.includes('--hash')

const data = await readFile(fileList, 'utf-8')
  .then(data => data.replaceAll('\r\n', '\n').split('\n').filter(Boolean))

console.log('Total files:', data.length)

const isSameFilename = new Set(data.map(url => new URL(url).pathname.split('/').pop()!)).size < data.length - 1

await downloadFiles(data, {
  dest,
  hash: hash || isSameFilename,
  proxy: true,
})

console.log('All images downloaded')
