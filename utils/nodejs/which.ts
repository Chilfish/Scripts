import { exec } from 'node:child_process'
import { access, constants } from 'node:fs'
import path from 'node:path'
import { promisify } from 'node:util'

const execAsync = promisify(exec)
const accessAsync = promisify(access)

/**
 * Find the path of a command
 * @param command - The command to find
 * @returns The path of the command or null if not found
 */
export async function which(command: string) {
  if (process.platform === 'win32') {
    const { stdout } = await execAsync(`where ${command}`)
    const paths = stdout.trim().split('\r\n')
    return paths[0] // Return the first match
  }

  // Linux/macOS/other Unix-like systems
  const paths = (process.env.PATH || '').split(path.delimiter)
  for (const dir of paths) {
    if (dir === '')
      continue // Skip empty paths
    const fullPath = path.join(dir, command)
    try {
      await accessAsync(fullPath, constants.X_OK) // Check if executable
      return fullPath // Found, so return immediately
    }
    catch (err) {
      // Not found in this directory, continue searching
    }
  }
  throw new Error(`command ${command} not found`)
}

export default which
