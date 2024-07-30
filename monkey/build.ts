import { fileURLToPath } from 'node:url'
import { readdir, rename } from 'node:fs/promises'
import path from 'node:path'
import { runCommand } from '~/utils/cli'

const cwd = path.dirname(fileURLToPath(import.meta.url))

console.log('build twitter-media')
await runCommand(`cd ${cwd}/twitter-media && vite build`)

console.log('build ins-exporter')
await runCommand(`cd ${cwd}/ins-export && vite build`)

console.log('move meta files')
const metaFiles = await readdir(`${cwd}`, { withFileTypes: true })
  .then(files => files.filter(file => file.isFile() && file.name.endsWith('.meta.js')))
  .then(files => files.map(file => file.name))

for (const file of metaFiles) {
  await rename(`${cwd}/${file}`, `${cwd}/meta/${file}`)
}

console.log('lint the code')

await runCommand(`cd ${cwd} && pnpm eslint **/*.js --fix`)

console.log('build complete')
