import type { Interceptor } from './types'
import { unsafeWindow } from '$'

/**
 * Global object reference. In some cases, the `unsafeWindow` is not available.
 */
const globalObject = unsafeWindow ?? window ?? globalThis

/**
 * The original XHR method backup.
 */
const xhrOpen = globalObject.XMLHttpRequest.prototype.open

export function httpHooks(interceptors: Interceptor[] = []) {
  globalObject.XMLHttpRequest.prototype.open = function (method: string, url: string) {
    this.addEventListener('load', () => {
      interceptors.forEach(func => func({ method, url }, this))
    })

    // @ts-expect-error it's fine.
    xhrOpen.apply(this, arguments)
  }
}
