import path from 'node:path'
import {
  createPrivateKey,
  createPublicKey,
  generateKeyPairSync,
  privateDecrypt,
  publicEncrypt,
} from 'node:crypto'
import { Buffer } from 'node:buffer'
import { readFile, writeFile } from 'node:fs/promises'
import { defineCommand, runMain } from 'citty'
import { consola } from 'consola'
import { prompt } from '../utils/node'

runMain(defineCommand({
  meta: {
    name: 'rsa',
    description: 'encrypt/decrypt data using RSA',
  },
  args: {
    mode: {
      type: 'string',
      description: 'encrypt/decrypt',
      default: 'encrypt',
    },
    data: {
      type: 'string',
      description: 'data to encrypt/decrypt',
    },
    publicKey: {
      type: 'string',
      description: 'public key file path',
      default: path.resolve('public.pem'),
    },
    privateKey: {
      type: 'string',
      description: 'private key file path',
      default: path.resolve('private.pem'),
    },
    genKeysOnly: {
      type: 'boolean',
      description: 'generate public/private keys only',
    },
    keyLength: {
      type: 'string',
      description: 'key length in bits',
      default: '1024',
    },
  },
  run: async ({ args }) => {
    let { mode, data, publicKey, privateKey, genKeysOnly, keyLength } = args
    if (genKeysOnly) {
      await genKeys(+keyLength)
      return
    }

    if (!data?.trim())
      data = await prompt('Enter data:')

    await main(mode as any, data, publicKey, privateKey)
  },
}))

async function main(
  mode: 'encrypt' | 'decrypt',
  data: string,
  publicKeyPath: string,
  privateKeyPath: string,
) {
  if (mode === 'encrypt') {
    const publicKey = createPublicKey(
      await readFile(publicKeyPath, 'utf8'),
    )
    const encrypted = publicEncrypt(publicKey, Buffer.from(data))
    consola.info(encrypted.toString('base64'))
    return
  }

  const privateKey = createPrivateKey(
    await readFile(privateKeyPath, 'utf8'),
  )

  const decrypted = privateDecrypt(privateKey, Buffer.from(data, 'base64'))
  consola.info(decrypted.toString())
}

async function genKeys(
  length = 1024,
) {
  if (length % 8 !== 0)
    throw new Error('Key length must be a multiple of 8')
  if (length < 512 || length > 16384)
    throw new Error('Key length must be between 512 and 16384')

  const { publicKey, privateKey } = generateKeyPairSync('rsa', {
    modulusLength: length,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  })

  await Promise.all([
    writeFile('public.pem', publicKey),
    writeFile('private.pem', privateKey),
  ])

  consola.info('Public and private keys generated successfully')
}
