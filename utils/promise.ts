import { PromiseFn } from '~/types'

class Queue<T = any> {
  private _queue: T[]
  constructor() {
    this._queue = []
  }

  enqueue(item: T) {
    this._queue.push(item)
  }

  dequeue() {
    return this._queue.shift()
  }

  get length() {
    return this._queue.length
  }
}

export interface PQueueOptions {
  /**
   * The maximum number of concurrent promises.
   * @default Infinity
   */
  concurrency: number
  /**
   * The minimum time in milliseconds between each promise
   * being executed.
   * @default 0
   */
  delay: number
}

const defaultOptions = {
  concurrency: Infinity,
  delay: 0,
} satisfies PQueueOptions

/**
 * A promises-based queue.
 */
export class PQueue {
  private _queue: Queue<PromiseFn>
  private _pending: number
  private _options: PQueueOptions

  constructor(options: Partial<PQueueOptions> = {}) {
    this._queue = new Queue()
    this._pending = 0
    this._options = { ...defaultOptions, ...options }
  }

  /**
   * Adds a promise to the queue.
   * @param {PromiseFn} fn The promise to add.
   */
  add(fn: PromiseFn) {
    return new Promise<ReturnType<typeof fn>>((resolve, reject) => {
      const run = async () => {
        this._pending++
        try {
          if (this._options.delay)
            await new Promise(resolve => setTimeout(resolve, this._options.delay))

          resolve(await fn())
        }
        catch (e) {
          reject(e)
        }
        finally {
          this._pending--
          this._next()
        }
      }

      this._queue.enqueue(run)
      this._next()
    })
  }

  addAll(fns: PromiseFn[]) {
    return Promise.all(fns.map(fn => this.add(fn)))
  }

  private _next() {
    if (this._pending >= this._options.concurrency)
      return

    const run = this._queue.dequeue()
    if (run)
      run()
  }

  /**
   * Waits for the queue to be empty.
   */
  async onIdle() {
    return new Promise<void>((resolve) => {
      const check = () => {
        if (this._queue.length === 0 && this._pending === 0)
          resolve()
        else
          setTimeout(check, this._options.delay)
      }
      check()
    })
  }

  /**
   * Clears the queue.
   */
  clear() {
    this._queue = new Queue()
  }
}
