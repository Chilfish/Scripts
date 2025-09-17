type Selector = keyof HTMLElementTagNameMap | ({} & string)

export function $<T = HTMLElement>(selector: Selector, root?: ParentNode) {
  return (root || document).querySelector(selector) as T | null
}

export function $$<T = HTMLElement>(selector: Selector, root?: ParentNode) {
  return Array.from((root || document).querySelectorAll(selector)) as T[]
}

// 配合 https://github.com/pushqrdx/vscode-inline-html 插件来高亮语法
export function css(strings: TemplateStringsArray, ...values: any[]) {
  if (!strings.length)
    return ''
  return String.raw(strings, ...values)
}

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

export function waitForElement<T = HTMLElement>(
  selector: Selector,
  options: {
    root?: Element | Document
    timeout?: number
    checkTextContent?: boolean
  } = {},
): Promise<T | null> {
  const {
    root = document.body,
    timeout = 1000 * 60,
    checkTextContent = true,
  } = options

  return new Promise((resolve) => {
    // Check if element already exists
    const existingElement = $(selector, root)
    if (existingElement && (!checkTextContent || existingElement.textContent)) {
      resolve(existingElement as T)
      return
    }

    const observer = new MutationObserver(() => {
      const element = $(selector, root)
      if (element && (!checkTextContent || element.textContent)) {
        observer.disconnect()
        resolve(element as T)
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
