import { GM_getValue, GM_setValue } from '$'

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
 */
export function waitForElement(
  selector: string,
  textContent = true,
) {
  return new Promise<HTMLElement>((resolve) => {
    function got(el: HTMLElement) {
      if (textContent && el.textContent)
        resolve(el)
      return resolve(el)
    }

    const el = $(selector)
    if (el) {
      got(el)
      return
    }

    const observer = new MutationObserver(() => {
      const el = $(selector)
      if (el) {
        observer.disconnect()
        got(el)
      }
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: false,
    })
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
}
