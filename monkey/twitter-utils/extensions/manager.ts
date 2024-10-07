import { unsafeWindow } from '$'
import logger from '../utils/logger'
import { Extension, ExtensionConstructor } from './extension'

/**
 * Global object reference. In some cases, the `unsafeWindow` is not available.
 */
const globalObject = unsafeWindow ?? window ?? globalThis

/**
 * The original XHR method backup.
 */
const xhrOpen = globalObject.XMLHttpRequest.prototype.open

/**
 * The registry for all extensions.
 */
export class ExtensionManager {
  private extensions: Map<string, Extension> = new Map()
  private disabledExtensions: Set<string> = new Set()

  constructor() {
    this.installHttpHooks()
  }

  /**
   * Register and instantiate a new extension.
   *
   * @param Ctor Extension constructor.
   */
  public add(Ctor: ExtensionConstructor) {
    try {
      logger.debug(`Register new extension: ${Ctor.name}`)
      const instance = new Ctor(this)
      this.extensions.set(instance.name, instance)
    }
    catch (err) {
      logger.error(`Failed to register extension: ${Ctor.name}`, err)
    }
  }

  /**
   * Set up all enabled extensions.
   */
  public start() {
    for (const ext of this.extensions.values()) {
      if (this.disabledExtensions.has(ext.name)) {
        this.disable(ext.name)
      }
      else {
        this.enable(ext.name)
      }
    }
  }

  public enable(name: string) {
    try {
      this.disabledExtensions.delete(name)

      const ext = this.extensions.get(name)!
      ext.enabled = true
      ext.setup()

      logger.debug(`Enabled extension: ${name}`)
    }
    catch (err) {
      logger.error(`Failed to enable extension: ${name}`, err)
    }
  }

  public disable(name: string) {
    try {
      this.disabledExtensions.add(name)

      const ext = this.extensions.get(name)!
      ext.enabled = false
      ext.dispose()

      logger.debug(`Disabled extension: ${name}`)
    }
    catch (err) {
      logger.error(`Failed to disable extension: ${name}`, err)
    }
  }

  public getExtensions() {
    return [...this.extensions.values()]
  }

  /**
   * Here we hooks the browser's XHR method to intercept Twitter's Web API calls.
   * This need to be done before any XHR request is made.
   */
  private installHttpHooks() {
    // eslint-disable-next-line ts/no-this-alias
    const manager = this

    globalObject.XMLHttpRequest.prototype.open = function (method: string, url: string) {
      // eslint-disable-next-line ts/no-this-alias
      const xhr = this

      // When the request is done, we call all registered interceptors.
      xhr.addEventListener('load', () => {
        // logger.debug(`XHR finished`, { method, url })

        // Run current enabled interceptors.
        manager
          .getExtensions()
          .filter(ext => ext.enabled)
          .forEach((ext) => {
            const func = ext.intercept()
            if (func) {
              func({ method, url }, xhr, ext)
            }
          })
      })

      // @ts-expect-error it's fine
      xhrOpen.apply(this, arguments)
    }

    logger.info('Hooked into XMLHttpRequest')

    // Check for current execution context.
    // The `webpackChunk_twitter_responsive_web` is injected by the Twitter website.
    // See: https://violentmonkey.github.io/posts/inject-into-context/
    setTimeout(() => {
      if (!('webpackChunk_twitter_responsive_web' in globalObject)) {
        logger.error(
          'Error: Wrong execution context detected.\n  '
          + 'This script needs to be injected into "page" context rather than "content" context.\n  '
          + 'The XMLHttpRequest hook will not work properly.\n  '
          + 'See: https://github.com/prinsss/twitter-web-exporter/issues/19',
        )
      }
    }, 1000)
  }
}
