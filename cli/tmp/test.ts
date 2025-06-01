/**
 * 重复执行函数
 * @param fun 要重复执行的函数
 * @param times 重复次数
 * @param wait 每次执行之间的等待时间（毫秒）
 * @returns 一个函数，调用该函数会开始重复执行
 */
function repeatRecursive<T extends (...args: any[]) => any>(
  fun: T,
  times: number,
  wait: number,
): (...args: Parameters<T>) => { cancel: () => void } {
  let timerId: number | null = null
  let currentCount = 0

  const execute = (...args: Parameters<T>) => {
    if (currentCount >= times) {
      return
    }

    try {
      fun(...args)
      currentCount++

      if (currentCount < times) {
        timerId = setTimeout(() => {
          execute(...args)
        }, wait) as any
      }
    } catch (error) {
      console.error('Error during repeated function execution:', error)
      cancel()
    }
  }

  const cancel = () => {
    if (timerId !== null) {
      clearTimeout(timerId)
      timerId = null
    }
  }

  return (...args: Parameters<T>) => {
    execute(...args)
    return { cancel }
  }
}

const funRecursive = repeatRecursive(console.error, 6, 400)

const repeatExecution = funRecursive('Hello Recursive')
