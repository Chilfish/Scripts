import extensions, { ExtensionConstructor } from './extensions'
import logger from './utils/logger'

const modules = import.meta.glob('./modules/*/index.ts', {
  eager: true,
}) as Record<string, () => ExtensionConstructor>

for (const path in modules) {
  const module = modules[path]()
  extensions.add(module)
}

extensions.start()

logger.info('Hello Twitter!')
