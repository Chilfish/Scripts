import type { GmDownloadOptions } from '$'
import { GM_deleteValue, GM_download, GM_getValue, GM_setValue } from '$'

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

export const store = {
  get<T>(key: string, fallback?: T) {
    const data = GM_getValue(key)
    if (!data) {
      this.set(key, fallback)
      return fallback
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

type Task = GmDownloadOptions & {
  onerror?: (result: any) => void
  retry?: number
}

/**
 * the download queue manager
 */
export const downloader = (() => {
  const tasks: Task[] = []
  const MAX_RETRY = 2
  const MAX_THREADS = 2
  let activeThreads = 0
  let retryCount = 0
  const isSaveAs = store.get('saveAs', false)

  function addTask(task: Task) {
    tasks.push(task)
    if (activeThreads < MAX_THREADS) {
      activeThreads++
      processNextTask()
    }
  }

  async function processNextTask() {
    const task = tasks.shift()
    if (!task)
      return
    await executeTask(task)
    if (tasks.length > 0 && activeThreads <= MAX_THREADS)
      processNextTask()
    else
      activeThreads--
  }

  const handleRetry = (task: Task, result: any) => {
    retryCount++
    if (retryCount === 3)
      activeThreads = 1

    if (
      task.retry && task.retry >= MAX_RETRY
      || result.details?.current === 'USER_CANCELED'
    ) {
      task.onerror?.(result)
    }
    else {
      if (activeThreads === 1)
        task.retry = (task.retry || 0) + 1

      addTask(task)
    }
  }

  function executeTask(task: Task) {
    return new Promise<void>((resolve) => {
      let downloadUrl = task.url
      const name = encodeURIComponent(task.name)
      if (isSaveAs) {
        // 其实是为了记录服务器的 modified-date 和命名
        downloadUrl = `https://proxy.chilfish.top/${name}?url=${downloadUrl}`
      }
      return GM_download({
        url: downloadUrl,
        name,
        saveAs: isSaveAs,
        onload: () => {
          task.onload?.()
          resolve()
        },
        onerror: (result) => {
          handleRetry(task, result)
          resolve()
        },
        ontimeout: () => {
          handleRetry(task, { details: { current: 'TIMEOUT' } })
          resolve()
        },
      })
    },
    )
  }

  return { add: addTask }
})()
