import { GM_download } from '$'

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
  let activeThreads = 0
  const MAX_THREADS = 2
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

export {
  Task as DownloadTask,
}
