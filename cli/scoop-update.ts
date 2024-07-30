import { execSync } from 'node:child_process'
import fs from 'node:fs'

// 读取要跳过的包名
function readSkipList(filePath: string) {
  const content = fs.readFileSync(filePath, 'utf8')
  return content.split('\n').map(line => line.trim()).filter(line => line.length > 0)
}

// 解析 scoop status 输出
function parseScoopStatus(output: string) {
  const lines = output.split('\n').slice(4)
  const packages = []

  for (const line of lines) {
    const parts = line.trim().split(/\s+/)
    const name = parts[0]
    packages.push(name)
  }
  return packages
}

// 执行 scoop update，跳过指定的包
function updateScoopPackages(skipList: string[]) {
  try {
    // 获取 scoop status 输出
    const statusOutput = execSync('scoop status').toString()
    const packagesToUpdate = parseScoopStatus(statusOutput)

    // 过滤掉需要跳过的包
    const filteredPackages = packagesToUpdate.filter(pkg => !skipList.includes(pkg))

    if (filteredPackages.length > 0) {
      console.log(`Updating packages: ${filteredPackages.join(', ')}`)
      execSync(`scoop update ${filteredPackages.join(' ')}`, { stdio: 'inherit' })
    }
    else {
      console.log('No packages to update.')
    }
  }
  catch (error) {
    console.error('Error during update:', error)
  }
}

const skipListFilePath = 'D:\\Scoop\\skip.txt'
const skipList = readSkipList(skipListFilePath)
updateScoopPackages(skipList)
