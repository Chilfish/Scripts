import { execSync } from 'node:child_process'
import { promisify } from 'node:util'
import { consola } from 'consola'

export const exec = (cmd: string) => promisify(() => execSync(cmd, { stdio: 'inherit' }))().catch(consola.error)
