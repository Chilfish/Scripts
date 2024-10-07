import { GM_deleteValue, GM_download, GM_getValue, GM_setValue } from '$'

export const $ = <T = HTMLElement>(selector: string, root: any = document) => root?.querySelector(selector) as T | null

export const $$ = <T = HTMLElement>(selector: string, root: any = document) => Array.from(root?.querySelectorAll(selector) || []) as T[]

// 配合 https://github.com/pushqrdx/vscode-inline-html 插件来高亮语法
export function css(raw: TemplateStringsArray) {
  return String.raw(raw)
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

interface Task {
  url: string
  name: string
  onload: () => void
  onerror: (result: any) => void
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
      task.onerror(result)
    }
    else {
      if (activeThreads === 1)
        task.retry = (task.retry || 0) + 1

      addTask(task)
    }
  }

  function executeTask(task: Task) {
    return new Promise<void>(resolve => GM_download({
      url: task.url,
      name: task.name,
      onload: () => {
        task.onload()
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
    }),
    )
  }

  return { add: addTask }
})()
