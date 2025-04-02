import { readFile } from 'node:fs/promises'
import { homedir } from 'node:os'
import {
  argvParser,
  dir,
  downloadFiles,
  prompt,
} from '~/utils/nodejs'

const fileList = dir(`${homedir()}/Desktop/file-list.txt`)
const dest = dir('F:/Downloads/tmp')

const { hash } = argvParser([{
  key: 'hash',
  type: 'boolean',
  description: 'append hash to filename',
  defaultValue: false,
}] as const)

const data = await readFile(fileList, 'utf-8')
  .catch(() => prompt('Enter the url list (split by `, `):'))
  .then(data => data
    .replaceAll('\r\n', '\n')
    .replaceAll(', ', '\n')
    .split('\n')
    .filter(Boolean))

console.log('Total files:', data.length, 'hash:', hash)

const isSameFilename = new Set(
  data.map(url => new URL(url).pathname.split('/').pop()!),
)
  .size < data.length - 1

await downloadFiles(data, {
  dest,
  hash: hash || isSameFilename,
  proxy: true,
  progress: true,
  concurrency: 1,
})

console.log('All images downloaded')
