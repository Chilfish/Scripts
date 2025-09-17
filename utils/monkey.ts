import type { GmDownloadOptions } from '$'
import { GM_deleteValue, GM_download, GM_getValue, GM_setValue } from '$'

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
