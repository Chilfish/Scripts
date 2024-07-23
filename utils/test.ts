import { loadConfig } from 'c12'
import { dir } from './file'

interface Source {
  id: number
  source: string
}

const config = await loadConfig<Source[]>({
  configFile: dir('data/input.yaml'),
})

const data = config.layers?.[0].config || []

console.log(data.slice(0, 10))
