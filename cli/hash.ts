import { createHash } from 'node:crypto'
import { Buffer } from 'node:buffer'
import { readFile, writeFile } from 'node:fs/promises'
import { execSync } from 'node:child_process'
import { dir } from '~/utils/file'
import { genToken, murmurHashV3, toBase62 } from '~/utils/math'

// or use `openssl dgst -sha256 -binary $file1 | openssl base64` instead
let str = process.argv.at(2)
const isTest = process.argv.includes('--TEST')

if (!str && !isTest) {
  console.error('Usage: tsx hash.ts <string>')
  process.exit(1)
}

const tmpFile = dir('data/tmp/random.txt')
str = await (async () => {
  const size = process.argv.at(3)

  async function write() {
    const str = genToken(Number(size || 10_0000))
    await writeFile(tmpFile, str)
    return str
  }

  if (size)
    return await write()
  return await readFile(tmpFile, 'utf-8').catch(write)
})()

console.log('Input len:', str.length)

console.time('openssl')
const openssl = execSync(`openssl dgst -sha256 -binary ${tmpFile}`)
console.timeEnd('openssl')

console.time('nodeSha256')
const nodeSha256 = createHash('sha256').update(str)
console.timeEnd('nodeSha256')

console.time('murmurHashV3')
const murmurHash = murmurHashV3(str)
console.timeEnd('murmurHashV3')

console.log({
  nodeSha256: nodeSha256.digest('base64'),
  openssl: Buffer.from(openssl).toString('base64'),
  murmurBase62: toBase62(murmurHash),
  murmurBase64: Buffer.from(murmurHash.toString()).toString('base64'),
})
