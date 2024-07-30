import { execSync } from 'node:child_process'
import { readFile } from 'node:fs/promises'

const skipListFilePath = 'D:/Scoop/skip.txt'
const skipList: string[] = await readFile(skipListFilePath, { encoding: 'utf-8' })
  .then(data => data
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean),
  )
  .catch(() => {
    console.log(`Skip list file not found: ${skipListFilePath}`)
    return []
  })

const packages = execSync('scoop status').toString()
  .split('\n')
  .slice(4)
  .map(line => line.trim().split(/\s+/)[0])
  .filter(pkg => !skipList.includes(pkg) && pkg)

if (packages.length > 0) {
  console.log(`Found ${packages.length} packages to update`)
  execSync(`scoop update ${packages.join(' ')}`, { stdio: 'inherit' })
}
else {
  console.log('No packages to update.')
}
