export * from './twitter'

export type FunctionType<T = any> = (...args: any[]) => T
export type PromiseFn<T = any> = (...args: any[]) => Promise<T>
