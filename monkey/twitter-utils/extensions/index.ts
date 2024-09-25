import { ExtensionManager } from './manager'

export * from './extension'
export * from './manager'

/**
 * Global extension manager singleton instance.
 */
const extensionManager = new ExtensionManager()

export default extensionManager
