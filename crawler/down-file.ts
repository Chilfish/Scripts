import { readFile } from 'node:fs/promises'
import { dir, downloadFiles } from '~/utils/index.node'

const fileList = dir(process.argv[2] || 'D:/Downloads/files.txt')
const dest = dir(process.argv[3] || 'D:/Downloads/tmp')

const data = await readFile(fileList, 'utf-8')
  .then(data => data.replaceAll('\r\n', '\n').split('\n').filter(Boolean))

console.log('Total files:', data.length)

await downloadFiles(data, { dest })

console.log('All images downloaded')
