import { execSync } from 'node:child_process'
import { readFile } from 'node:fs/promises'

function isNotPatchUpdate(current: string, latest: string) {
  if (!current?.trim() || !latest?.trim()) {
    return false
  }
  const [currentMajor, currentMinor, _currentPatch] = current.split('.')
  const [latestMajor, latestMinor, _latestPatch] = latest.split('.')
  return currentMajor !== latestMajor || currentMinor !== latestMinor
}

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

execSync('scoop update')

const packages = execSync('scoop status')
  .toString()
  .split('\n')
  .slice(4)
  .map((line) => {
    // name       3.4.4             3.5.4
    const [name, current, latest] = line.split(/\s+/)
    if (
      skipList.includes(name)
      || !isNotPatchUpdate(current, latest)
    ) {
      return null
    }

    return name
  })
  .filter(Boolean)

if (packages.length > 0) {
  console.log(`Found ${packages.length} packages to update`)
  execSync(`scoop update ${packages.join(' ')}`, { stdio: 'inherit' })
}
else {
  console.log('No packages to update.')
}
