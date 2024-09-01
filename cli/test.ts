import { readJson } from '~/utils/file'

const packages = await readJson('D:/Dev/Node/pnpm-modules/global/5/package.json')

const dependencies = Object.keys(packages.dependencies)

console.log(dependencies.join(' '))
