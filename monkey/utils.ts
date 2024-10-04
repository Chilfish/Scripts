import { GM_deleteValue, GM_getValue, GM_setValue } from '$'

export const $ = <T = HTMLElement>(selector: string, root: any = document) => root?.querySelector(selector) as T | null

export const $$ = <T = HTMLElement>(selector: string, root: any = document) => Array.from(root?.querySelectorAll(selector) || []) as T[]

export function saveBlobUrl(url: string, filename: string) {
  console.log(`Downloaded: ${filename} (${url})`)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  a.remove()
}

export function saveAs(
  data: string | object | Blob,
  filename: string,
  inline = false,
) {
  let blob: Blob

  if (typeof data === 'string') {
    blob = new Blob([data], { type: 'text/plain' })
  }
  else if (data instanceof Blob) {
    blob = data
  }
  else {
    blob = new Blob(
      [JSON.stringify(data, null, inline ? 0 : 2)],
      { type: 'application/json' },
    )
  }

  const url = URL.createObjectURL(blob)
  saveBlobUrl(url, filename)
  URL.revokeObjectURL(url)
}

/**
 * Wait for an element to be added to the DOM.
 * @param selector - CSS selector for the element
 * @param options - Optional configuration
 * @returns Promise that resolves with the found element
 */
export function waitForElement(
  selector: string,
  options: {
    root?: Element | Document
    timeout?: number
    checkTextContent?: boolean
  } = {},
): Promise<Element | null> {
  const {
    root = document.body,
    timeout = 1000 * 60,
    checkTextContent = true,
  } = options

  return new Promise((resolve) => {
    // Check if element already exists
    const existingElement = $(selector, root)
    if (existingElement && (!checkTextContent || existingElement.textContent)) {
      resolve(existingElement)
      return
    }

    const observer = new MutationObserver(() => {
      const element = $(selector, root)
      if (element && (!checkTextContent || element.textContent)) {
        observer.disconnect()
        resolve(element)
      }
    })

    observer.observe(root, {
      childList: true,
      subtree: true,
      attributes: true,
    })

    // Set timeout to avoid waiting indefinitely
    if (timeout > 0) {
      setTimeout(() => {
        observer.disconnect()
        console.warn(`Timeout waiting for element: ${selector}`)
        resolve(null)
      }, timeout)
    }
  })
}

export const store = {
  get<T>(key: string) {
    const data = GM_getValue(key)
    if (!data) {
      this.set(key, null)
      return null
    }
    return data as T
  },
  set(key: string, value: any) {
    GM_setValue(key, value)
  },
  remove(key: string) {
    GM_deleteValue(key)
  },
}
