import { cp, mkdir, stat, symlink } from 'node:fs/promises'
import path from 'node:path'
import { argvParser } from '../utils/nodejs/cli'

const argv = argvParser([{
  key: 'source',
  shortKey: 's',
  description: 'The source file to copy',
  required: true,
  beforeSet: (value) => {
    return path.resolve(value)
  },
}, {
  key: 'destination',
  shortKey: 'd',
  description: 'The destination file to copy',
  required: true,
  beforeSet: (value) => {
    return path.resolve(value)
  },
}, {
  key: 'recursive',
  shortKey: 'r',
  description: 'Copy the directory recursively',
  type: 'boolean',
  default: false,
}, {
  key: 'force',
  shortKey: 'f',
  description: 'Force the copy even if the destination file already exists',
  type: 'boolean',
  default: false,
}, {
  key: 'link',
  shortKey: 'l',
  description: 'Create a symbolic link instead of copying the file',
  type: 'boolean',
  default: false,
}] as const)

let { source, destination, recursive, force, link } = argv

async function main() {
  const destinationStat = await stat(destination).catch(() => null)
  const isDirectory = destinationStat?.isDirectory() || path.extname(destination) === ''

  if (isDirectory && recursive) {
    destination = path.join(destination, path.basename(source))
    const dir = path.dirname(destination)
    await mkdir(dir, { recursive: true })
  }

  console.log({
    source,
    destination,
    recursive,
    force,
    link,
  })

  if (link) {
    const linkStat = await stat(source).catch(() => null)
    const isDirectory = linkStat?.isDirectory() || path.extname(source) === ''

    const type = isDirectory ? 'dir' : 'file'
    await symlink(source, destination, type)
    return
  }

  await cp(source, destination, {
    recursive,
    force,
  })
}

main()
  .catch((error) => {
    console.error(`${error}`)
    process.exit(1)
  })
