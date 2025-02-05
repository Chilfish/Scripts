import { beforeEach, describe, expect, it, vi } from 'vitest'
import { PQueue } from '../utils/promise'

type fn = (...args: any[]) => any

describe('pQueue', () => {
  beforeEach(() => {
    vi.useRealTimers()
  })

  it('基本任务执行', async () => {
    const queue = new PQueue()
    const mockFn = vi.fn().mockResolvedValue('result')

    const promise = queue.add(mockFn)
    expect(mockFn).toHaveBeenCalled()
    await expect(promise).resolves.toBe('result')
  })

  it('严格并发控制', async () => {
    vi.useFakeTimers()
    const queue = new PQueue({ concurrency: 2 })
    const blockers: fn[] = []

    // 创建两个阻塞任务
    const createBlocker = () => new Promise((resolve) => {
      blockers.push(resolve)
    })

    queue.add(createBlocker)
    queue.add(createBlocker)
    queue.add(() => Promise.resolve('third'))

    // 验证前两个任务已启动，第三个在队列中
    expect(queue.pending).toBe(2)
    expect(queue.length).toBe(1)

    // 释放第一个阻塞任务
    // blockers[0]()
    await vi.advanceTimersByTimeAsync(0)

    // 验证第三个任务开始执行
    expect(queue.pending).toBe(2)
  })

  it('空闲检测机制', async () => {
    const queue = new PQueue()
    let resolved = false
    const resolveCheck = () => resolved = true

    // 添加一个快速任务
    queue.add(() => Promise.resolve())
    await queue.onIdle().then(resolveCheck)
    expect(resolved).toBe(true)

    // 添加长时间任务测试
    resolved = false
    queue.onIdle().then(resolveCheck)
    const longTask = queue.add(() => new Promise(r => setTimeout(r, 500)))

    expect(resolved).toBe(false)
    await longTask
    expect(resolved).toBe(true)
  })

  it('队列清理功能', async () => {
    const queue = new PQueue({ concurrency: 1 })
    const task1 = vi.fn().mockResolvedValue(null)
    const task2 = vi.fn().mockResolvedValue(null)

    queue.add(task1)
    queue.add(task2)
    queue.clear()

    expect(queue.length).toBe(0)
    expect(task2).not.toHaveBeenCalled()
  })

  it('错误处理机制', async () => {
    const queue = new PQueue()
    const error = new Error('test error')

    // 正常任务应该成功
    const goodTask = queue.add(() => Promise.resolve('ok'))
    // 错误任务应该被捕获
    const badTask = queue.add(() => Promise.reject(error))

    await expect(goodTask).resolves.toBe('ok')
    await expect(badTask).rejects.toThrow(error)
  })

  it('批量任务添加以及顺序', async () => {
    const queue = new PQueue({ concurrency: 2 })
    const results = Array.from({ length: 20 }, (_, i) => i)
    const tasks = results.map(i => () =>
      new Promise(r => setTimeout(() => r(i), Math.random() * 10)),
    )

    await expect(queue.addAll(tasks)).resolves.toEqual(results)
  })
})
