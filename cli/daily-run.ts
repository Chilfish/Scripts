import { execSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '../')

const scripts = {
  checkIn: {
    path: 'cli/checkin.ts',
    args: '',
  },
}

for (const value of Object.values(scripts)) {
  const script = path.resolve(root, value.path)
  const args = value.args

  const command = `bun run ${script} ${args}`

  execSync(command, { stdio: 'inherit' })
}
